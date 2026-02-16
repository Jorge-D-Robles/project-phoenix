import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { NoteService } from './note.service';
import type { Note } from './models/note.model';

const DRIVE_BASE = 'https://www.googleapis.com/drive/v3';
const UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'file-1',
    title: 'Test Note',
    content: '<p>Hello world</p>',
    labels: ['work', 'important'],
    color: 'BLUE',
    attachments: [],
    created: '2026-02-16T10:00:00Z',
    lastModified: '2026-02-16T12:00:00Z',
    ...overrides,
  };
}

function makeNotePayload(note: Note): Omit<Note, 'id'> {
  const { id, ...rest } = note;
  return rest;
}

describe('NoteService', () => {
  let service: NoteService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NoteService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(NoteService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  describe('listNotes', () => {
    it('should find the Phoenix_Notes folder and list notes', () => {
      let result: Note[] | undefined;

      service.listNotes().subscribe(r => result = r);

      // Step 1: Find folder
      const folderReq = httpTesting.expectOne(r =>
        r.url === `${DRIVE_BASE}/files` &&
        r.method === 'GET' &&
        r.params.get('q')!.includes('Phoenix_Notes'),
      );
      folderReq.flush({ files: [{ id: 'folder-1', name: 'Phoenix_Notes', mimeType: 'application/vnd.google-apps.folder' }] });

      // Step 2: List files in folder
      const listReq = httpTesting.expectOne(r =>
        r.url === `${DRIVE_BASE}/files` &&
        r.method === 'GET' &&
        r.params.get('q')!.includes('folder-1'),
      );
      listReq.flush({ files: [{ id: 'file-1', name: 'note-abc.json', mimeType: 'application/json' }] });

      // Step 3: Download content for each file
      const downloadReq = httpTesting.expectOne(r =>
        r.url === `${DRIVE_BASE}/files/file-1` &&
        r.params.get('alt') === 'media',
      );
      downloadReq.flush(makeNote());

      expect(result).toBeDefined();
      expect(result!.length).toBe(1);
      expect(result![0].id).toBe('file-1');
      expect(result![0].title).toBe('Test Note');
    });

    it('should create the folder if it does not exist', () => {
      let result: Note[] | undefined;

      service.listNotes().subscribe(r => result = r);

      // Step 1: Search for folder — not found
      const folderReq = httpTesting.expectOne(r =>
        r.url === `${DRIVE_BASE}/files` &&
        r.params.get('q')!.includes('Phoenix_Notes'),
      );
      folderReq.flush({ files: [] });

      // Step 2: Create folder
      const createFolderReq = httpTesting.expectOne(r =>
        r.url === `${DRIVE_BASE}/files` &&
        r.method === 'POST',
      );
      expect(createFolderReq.request.body.name).toBe('Phoenix_Notes');
      expect(createFolderReq.request.body.mimeType).toBe('application/vnd.google-apps.folder');
      createFolderReq.flush({ id: 'new-folder-1', name: 'Phoenix_Notes', mimeType: 'application/vnd.google-apps.folder' });

      // Step 3: List files in newly created folder (empty)
      const listReq = httpTesting.expectOne(r =>
        r.url === `${DRIVE_BASE}/files` &&
        r.params.get('q')!.includes('new-folder-1'),
      );
      listReq.flush({ files: [] });

      expect(result).toBeDefined();
      expect(result!.length).toBe(0);
    });

    it('should return empty array when folder has no notes', () => {
      let result: Note[] | undefined;

      service.listNotes().subscribe(r => result = r);

      // Find folder
      const folderReq = httpTesting.expectOne(r =>
        r.url === `${DRIVE_BASE}/files` &&
        r.params.get('q')!.includes('Phoenix_Notes'),
      );
      folderReq.flush({ files: [{ id: 'folder-1', name: 'Phoenix_Notes', mimeType: 'application/vnd.google-apps.folder' }] });

      // List files — empty
      const listReq = httpTesting.expectOne(r =>
        r.url === `${DRIVE_BASE}/files` &&
        r.params.get('q')!.includes('folder-1'),
      );
      listReq.flush({ files: [] });

      expect(result).toBeDefined();
      expect(result!.length).toBe(0);
    });
  });

  describe('getNote', () => {
    it('should download and return a single note', () => {
      let result: Note | undefined;

      service.getNote('file-1').subscribe(r => result = r);

      const req = httpTesting.expectOne(r =>
        r.url === `${DRIVE_BASE}/files/file-1` &&
        r.params.get('alt') === 'media',
      );
      req.flush(makeNote());

      expect(result).toBeDefined();
      expect(result!.id).toBe('file-1');
      expect(result!.title).toBe('Test Note');
    });
  });

  describe('createNote', () => {
    it('should find folder, create file metadata, then upload content', () => {
      const noteData = makeNotePayload(makeNote());
      let result: Note | undefined;

      service.createNote(noteData).subscribe(r => result = r);

      // Step 1: Find folder
      const folderReq = httpTesting.expectOne(r =>
        r.url === `${DRIVE_BASE}/files` &&
        r.method === 'GET' &&
        r.params.get('q')!.includes('Phoenix_Notes'),
      );
      folderReq.flush({ files: [{ id: 'folder-1', name: 'Phoenix_Notes', mimeType: 'application/vnd.google-apps.folder' }] });

      // Step 2: Create file metadata
      const createReq = httpTesting.expectOne(r =>
        r.url === `${DRIVE_BASE}/files` &&
        r.method === 'POST' &&
        r.body.parents?.includes('folder-1'),
      );
      expect(createReq.request.body.mimeType).toBe('application/json');
      createReq.flush({ id: 'new-file-1', name: 'note-abc.json', mimeType: 'application/json' });

      // Step 3: Upload content
      const uploadReq = httpTesting.expectOne(r =>
        r.url === `${UPLOAD_BASE}/files/new-file-1` &&
        r.method === 'PATCH' &&
        r.params.get('uploadType') === 'media',
      );
      uploadReq.flush(makeNote({ id: 'new-file-1' }));

      expect(result).toBeDefined();
      expect(result!.id).toBe('new-file-1');
    });

    it('should create folder if it does not exist, then create note', () => {
      const noteData = makeNotePayload(makeNote());
      let result: Note | undefined;

      service.createNote(noteData).subscribe(r => result = r);

      // Step 1: Folder not found
      const folderReq = httpTesting.expectOne(r =>
        r.url === `${DRIVE_BASE}/files` &&
        r.method === 'GET' &&
        r.params.get('q')!.includes('Phoenix_Notes'),
      );
      folderReq.flush({ files: [] });

      // Step 2: Create folder
      const createFolderReq = httpTesting.expectOne(r =>
        r.url === `${DRIVE_BASE}/files` &&
        r.method === 'POST' &&
        r.body.mimeType === 'application/vnd.google-apps.folder',
      );
      createFolderReq.flush({ id: 'new-folder-1', name: 'Phoenix_Notes', mimeType: 'application/vnd.google-apps.folder' });

      // Step 3: Create file metadata
      const createReq = httpTesting.expectOne(r =>
        r.url === `${DRIVE_BASE}/files` &&
        r.method === 'POST' &&
        r.body.parents?.includes('new-folder-1'),
      );
      createReq.flush({ id: 'new-file-1', name: 'note-abc.json', mimeType: 'application/json' });

      // Step 4: Upload content
      const uploadReq = httpTesting.expectOne(r =>
        r.url === `${UPLOAD_BASE}/files/new-file-1` &&
        r.method === 'PATCH' &&
        r.params.get('uploadType') === 'media',
      );
      uploadReq.flush(makeNote({ id: 'new-file-1' }));

      expect(result).toBeDefined();
      expect(result!.id).toBe('new-file-1');
    });
  });

  describe('updateNote', () => {
    it('should PATCH the file with updated content', () => {
      const noteData = makeNotePayload(makeNote({ title: 'Updated Title' }));
      let result: Note | undefined;

      service.updateNote('file-1', noteData).subscribe(r => result = r);

      const req = httpTesting.expectOne(r =>
        r.url === `${UPLOAD_BASE}/files/file-1` &&
        r.method === 'PATCH' &&
        r.params.get('uploadType') === 'media',
      );
      expect(req.request.body.title).toBe('Updated Title');
      req.flush(makeNote({ title: 'Updated Title' }));

      expect(result).toBeDefined();
      expect(result!.title).toBe('Updated Title');
    });
  });

  describe('deleteNote', () => {
    it('should DELETE the file', () => {
      let completed = false;

      service.deleteNote('file-1').subscribe(() => completed = true);

      const req = httpTesting.expectOne(r =>
        r.url === `${DRIVE_BASE}/files/file-1` &&
        r.method === 'DELETE',
      );
      req.flush(null);

      expect(completed).toBeTrue();
    });
  });
});
