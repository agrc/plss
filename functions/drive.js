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

const createFolder = async (name, parentId, root) => {
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

  const folder = folders.data.files.find(
    (folder) =>
      folder.name.toLowerCase() === name.toLowerCase() &&
      (root || (folder.parents && folder.parents[0] === parentId)),
  );

  if (folder) {
    return folder.id;
  }

  const newFolder = await drive.files.create({
    resource: fileMetadata,
    fields: 'id',
    supportsAllDrives: true,
  });

  return newFolder.data.id;
};

const getParentFolderId = async (sharedDriveId, path) => {
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
  sharedDriveId,
  pdf,
  blmPointId,
  county,
  year,
) => {
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
    resource: fileMetadata,
    media: media,
    fields: 'id',
    supportsAllDrives: true,
  });

  return response.data.id;
};
