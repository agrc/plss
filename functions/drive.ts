import { google } from 'googleapis';
import { Readable } from 'node:stream';

const folderMimeType = 'application/vnd.google-apps.folder';

const auth = new google.auth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({
  version: 'v3',
  auth,
});

const requireId = (id: string | null | undefined, name: string): string => {
  if (!id) {
    throw new Error(`Google Drive did not return an ID for ${name}.`);
  }

  return id;
};

const createFolder = async (
  name: string,
  parentId: string,
  root: boolean,
): Promise<string> => {
  const fileMetadata = {
    name,
    mimeType: folderMimeType,
    parents: [parentId],
  };

  const folders = await drive.files.list({
    q: `mimeType = '${folderMimeType}' and trashed = false and name = '${name}' and '${parentId}' in parents`,
    fields: 'files(id, name, parents)',
    supportsAllDrives: true,
  });

  const folder = folders.data.files?.find(
    (candidate) =>
      candidate.name?.toLowerCase() === name.toLowerCase() &&
      (root || candidate.parents?.[0] === parentId),
  );

  if (folder) {
    return requireId(folder.id, name);
  }

  const newFolder = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id',
    supportsAllDrives: true,
  });

  return requireId(newFolder.data.id, name);
};

const getParentFolderId = async (
  sharedDriveId: string,
  path: string,
): Promise<string> => {
  const parts = path.split('/');
  let id = sharedDriveId;
  let first = true;

  for (const part of parts) {
    id = await createFolder(part, id, first);
    first = false;
  }

  return id;
};

export const uploadFile = async (
  sharedDriveId: string,
  pdf: Uint8Array,
  blmPointId: string,
  county: string,
  year: number | string,
): Promise<string> => {
  const mainFolder =
    process.env.NODE_ENV === 'production' ? 'MRRC' : 'MRRC-test';
  const parentId = await getParentFolderId(
    sharedDriveId,
    `${mainFolder}/FY${year}/FY${year} Deliverables/${county} County/Tie Sheets`,
  );

  const fileMetadata = {
    name: `${blmPointId}.pdf`,
    parents: [parentId],
  };
  const media = {
    mimeType: 'application/pdf',
    body: Readable.from(pdf),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id',
    supportsAllDrives: true,
  });

  return requireId(response.data.id, fileMetadata.name);
};
