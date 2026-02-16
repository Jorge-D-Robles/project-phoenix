import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { HabitService } from './habit.service';
import { HabitsData, GoogleDriveFileList } from './models/habit.model';

const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';

const MOCK_HABITS_DATA: HabitsData = {
  habits: [
    {
      id: 'h1',
      title: 'Exercise',
      frequency: 'DAILY',
      targetValue: 1,
      color: '#4CAF50',
      archived: false,
      created: '2026-02-16T00:00:00Z',
      lastModified: '2026-02-16T00:00:00Z',
    },
  ],
  logs: [
    { habitId: 'h1', date: '2026-02-16', value: 1 },
  ],
};

describe('HabitService', () => {
  let service: HabitService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HabitService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(HabitService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  describe('loadData', () => {
    it('should search for habits.json in appDataFolder', () => {
      service.loadData().subscribe();

      const req = httpTesting.expectOne(r =>
        r.url === DRIVE_FILES_URL &&
        r.method === 'GET' &&
        r.params.get('spaces') === 'appDataFolder' &&
        r.params.get('q') === "name='habits.json'",
      );
      req.flush({ files: [] });
    });

    it('should return empty data when habits.json is not found', () => {
      let result: HabitsData | undefined;

      service.loadData().subscribe(r => result = r);

      const searchReq = httpTesting.expectOne(r =>
        r.url === DRIVE_FILES_URL && r.method === 'GET',
      );
      searchReq.flush({ files: [] } as GoogleDriveFileList);

      expect(result).toEqual({ habits: [], logs: [] });
    });

    it('should download and parse habits.json when found', () => {
      let result: HabitsData | undefined;

      service.loadData().subscribe(r => result = r);

      // Step 1: Search returns a file
      const searchReq = httpTesting.expectOne(r =>
        r.url === DRIVE_FILES_URL && r.method === 'GET',
      );
      searchReq.flush({
        files: [{ id: 'file-123', name: 'habits.json', mimeType: 'application/json' }],
      } as GoogleDriveFileList);

      // Step 2: Download the file content
      const downloadReq = httpTesting.expectOne(r =>
        r.url === `${DRIVE_FILES_URL}/file-123` &&
        r.method === 'GET' &&
        r.params.get('alt') === 'media',
      );
      downloadReq.flush(MOCK_HABITS_DATA);

      expect(result).toEqual(MOCK_HABITS_DATA);
    });

    it('should return empty data when file list is undefined', () => {
      let result: HabitsData | undefined;

      service.loadData().subscribe(r => result = r);

      const searchReq = httpTesting.expectOne(r =>
        r.url === DRIVE_FILES_URL && r.method === 'GET',
      );
      searchReq.flush({} as GoogleDriveFileList);

      expect(result).toEqual({ habits: [], logs: [] });
    });
  });

  describe('saveData', () => {
    it('should search for existing habits.json before saving', () => {
      service.saveData(MOCK_HABITS_DATA).subscribe();

      const searchReq = httpTesting.expectOne(r =>
        r.url === DRIVE_FILES_URL && r.method === 'GET',
      );
      searchReq.flush({
        files: [{ id: 'file-123', name: 'habits.json', mimeType: 'application/json' }],
      });

      const updateReq = httpTesting.expectOne(r =>
        r.url === `${DRIVE_UPLOAD_URL}/file-123` && r.method === 'PATCH',
      );
      updateReq.flush({});
    });

    it('should PATCH update when habits.json already exists', () => {
      service.saveData(MOCK_HABITS_DATA).subscribe();

      const searchReq = httpTesting.expectOne(r =>
        r.url === DRIVE_FILES_URL && r.method === 'GET',
      );
      searchReq.flush({
        files: [{ id: 'file-123', name: 'habits.json', mimeType: 'application/json' }],
      });

      const updateReq = httpTesting.expectOne(r =>
        r.url === `${DRIVE_UPLOAD_URL}/file-123` &&
        r.method === 'PATCH' &&
        r.params.get('uploadType') === 'media',
      );
      expect(updateReq.request.body).toEqual(MOCK_HABITS_DATA);
      updateReq.flush({});
    });

    it('should POST create when habits.json does not exist', () => {
      service.saveData(MOCK_HABITS_DATA).subscribe();

      const searchReq = httpTesting.expectOne(r =>
        r.url === DRIVE_FILES_URL && r.method === 'GET',
      );
      searchReq.flush({ files: [] });

      // Expect multipart upload — POST to upload endpoint
      const createReq = httpTesting.expectOne(r =>
        r.url === DRIVE_UPLOAD_URL &&
        r.method === 'POST' &&
        r.params.get('uploadType') === 'multipart',
      );
      expect(createReq.request.body).toBeTruthy();
      createReq.flush({ id: 'new-file-id' });
    });
  });
});
