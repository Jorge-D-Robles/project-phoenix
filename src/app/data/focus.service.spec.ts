import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { FocusService } from './focus.service';
import { DEFAULT_FOCUS_SETTINGS } from './models/focus-session.model';
import type { FocusSession, FocusSettings } from './models/focus-session.model';
import type { GoogleDriveFileList } from './models/google-drive.model';

const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';

const MOCK_SESSIONS: FocusSession[] = [
  {
    id: 'fs1',
    taskId: 't1',
    taskTitle: 'Write report',
    startTime: '2026-02-16T10:00:00Z',
    plannedDuration: 25,
    actualDuration: 25,
    completed: true,
    type: 'WORK',
  },
];

const MOCK_SETTINGS: FocusSettings = {
  workDuration: 30,
  shortBreakDuration: 10,
  longBreakDuration: 20,
  sessionsBeforeLongBreak: 3,
  autoStartBreaks: true,
  autoStartWork: false,
};

describe('FocusService', () => {
  let service: FocusService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FocusService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(FocusService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  describe('loadSessions', () => {
    it('should search for focus-sessions.json in appDataFolder', () => {
      service.loadSessions().subscribe();

      const req = httpTesting.expectOne(r =>
        r.url === DRIVE_FILES_URL &&
        r.method === 'GET' &&
        r.params.get('spaces') === 'appDataFolder' &&
        r.params.get('q') === "name='focus-sessions.json'",
      );
      req.flush({ files: [] });
    });

    it('should return empty array when focus-sessions.json is not found', () => {
      let result: FocusSession[] | undefined;

      service.loadSessions().subscribe(r => result = r);

      const searchReq = httpTesting.expectOne(r =>
        r.url === DRIVE_FILES_URL && r.method === 'GET',
      );
      searchReq.flush({ files: [] } as GoogleDriveFileList);

      expect(result).toEqual([]);
    });

    it('should download and parse sessions when file is found', () => {
      let result: FocusSession[] | undefined;

      service.loadSessions().subscribe(r => result = r);

      const searchReq = httpTesting.expectOne(r =>
        r.url === DRIVE_FILES_URL && r.method === 'GET',
      );
      searchReq.flush({
        files: [{ id: 'file-1', name: 'focus-sessions.json', mimeType: 'application/json' }],
      } as GoogleDriveFileList);

      const downloadReq = httpTesting.expectOne(r =>
        r.url === `${DRIVE_FILES_URL}/file-1` &&
        r.method === 'GET' &&
        r.params.get('alt') === 'media',
      );
      downloadReq.flush(MOCK_SESSIONS);

      expect(result).toEqual(MOCK_SESSIONS);
    });

    it('should return empty array when file list is undefined', () => {
      let result: FocusSession[] | undefined;

      service.loadSessions().subscribe(r => result = r);

      const searchReq = httpTesting.expectOne(r =>
        r.url === DRIVE_FILES_URL && r.method === 'GET',
      );
      searchReq.flush({} as GoogleDriveFileList);

      expect(result).toEqual([]);
    });
  });

  describe('saveSessions', () => {
    it('should PATCH update when file already exists', () => {
      service.saveSessions(MOCK_SESSIONS).subscribe();

      const searchReq = httpTesting.expectOne(r =>
        r.url === DRIVE_FILES_URL && r.method === 'GET',
      );
      searchReq.flush({
        files: [{ id: 'file-1', name: 'focus-sessions.json', mimeType: 'application/json' }],
      });

      const updateReq = httpTesting.expectOne(r =>
        r.url === `${DRIVE_UPLOAD_URL}/file-1` &&
        r.method === 'PATCH' &&
        r.params.get('uploadType') === 'media',
      );
      expect(updateReq.request.body).toEqual(MOCK_SESSIONS);
      updateReq.flush({});
    });

    it('should POST create when file does not exist', () => {
      service.saveSessions(MOCK_SESSIONS).subscribe();

      const searchReq = httpTesting.expectOne(r =>
        r.url === DRIVE_FILES_URL && r.method === 'GET',
      );
      searchReq.flush({ files: [] });

      const createReq = httpTesting.expectOne(r =>
        r.url === DRIVE_UPLOAD_URL &&
        r.method === 'POST' &&
        r.params.get('uploadType') === 'multipart',
      );
      expect(createReq.request.body).toBeTruthy();
      createReq.flush({ id: 'new-file-id' });
    });
  });

  describe('loadSettings', () => {
    it('should search for focus-settings.json in appDataFolder', () => {
      service.loadSettings().subscribe();

      const req = httpTesting.expectOne(r =>
        r.url === DRIVE_FILES_URL &&
        r.method === 'GET' &&
        r.params.get('spaces') === 'appDataFolder' &&
        r.params.get('q') === "name='focus-settings.json'",
      );
      req.flush({ files: [] });
    });

    it('should return DEFAULT_FOCUS_SETTINGS when file is not found', () => {
      let result: FocusSettings | undefined;

      service.loadSettings().subscribe(r => result = r);

      const searchReq = httpTesting.expectOne(r =>
        r.url === DRIVE_FILES_URL && r.method === 'GET',
      );
      searchReq.flush({ files: [] } as GoogleDriveFileList);

      expect(result).toEqual(DEFAULT_FOCUS_SETTINGS);
    });

    it('should download and parse settings when file is found', () => {
      let result: FocusSettings | undefined;

      service.loadSettings().subscribe(r => result = r);

      const searchReq = httpTesting.expectOne(r =>
        r.url === DRIVE_FILES_URL && r.method === 'GET',
      );
      searchReq.flush({
        files: [{ id: 'file-2', name: 'focus-settings.json', mimeType: 'application/json' }],
      } as GoogleDriveFileList);

      const downloadReq = httpTesting.expectOne(r =>
        r.url === `${DRIVE_FILES_URL}/file-2` &&
        r.method === 'GET' &&
        r.params.get('alt') === 'media',
      );
      downloadReq.flush(MOCK_SETTINGS);

      expect(result).toEqual(MOCK_SETTINGS);
    });
  });

  describe('saveSettings', () => {
    it('should PATCH update when file already exists', () => {
      service.saveSettings(MOCK_SETTINGS).subscribe();

      const searchReq = httpTesting.expectOne(r =>
        r.url === DRIVE_FILES_URL && r.method === 'GET',
      );
      searchReq.flush({
        files: [{ id: 'file-2', name: 'focus-settings.json', mimeType: 'application/json' }],
      });

      const updateReq = httpTesting.expectOne(r =>
        r.url === `${DRIVE_UPLOAD_URL}/file-2` &&
        r.method === 'PATCH' &&
        r.params.get('uploadType') === 'media',
      );
      expect(updateReq.request.body).toEqual(MOCK_SETTINGS);
      updateReq.flush({});
    });

    it('should POST create when file does not exist', () => {
      service.saveSettings(MOCK_SETTINGS).subscribe();

      const searchReq = httpTesting.expectOne(r =>
        r.url === DRIVE_FILES_URL && r.method === 'GET',
      );
      searchReq.flush({ files: [] });

      const createReq = httpTesting.expectOne(r =>
        r.url === DRIVE_UPLOAD_URL &&
        r.method === 'POST' &&
        r.params.get('uploadType') === 'multipart',
      );
      expect(createReq.request.body).toBeTruthy();
      createReq.flush({ id: 'new-settings-id' });
    });
  });
});
