/** Google Drive file resource (minimal shape) */
export interface GoogleDriveFile {
  readonly id: string;
  readonly name: string;
  readonly mimeType: string;
}

/** Google Drive files.list response */
export interface GoogleDriveFileList {
  readonly files?: readonly GoogleDriveFile[];
}
