import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  deleteObject,
  uploadString,
  uploadBytes,
  getBytes,
  ref,
  listAll,
} from 'firebase/storage';
import { beforeAll, afterAll, describe, it } from 'vitest';
import { readFileSync } from 'fs';

describe('storage', () => {
  let testEnv;
  const userId = 'user_abc';
  const blmPoint = 'point_abc';

  const getPaths = (storage) => {
    return {
      base: ref(storage, 'base.png'),
      submitter: ref(storage, 'submitters/submitterFolder.png'),
      user: ref(storage, `submitters/${userId}/userFolder.png`),
      point: ref(storage, `submitters/${userId}/${blmPoint}/pointFolder.png`),
    };
  };

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storage: {
        rules: readFileSync('./storage.rules', 'utf8'),
        host: 'localhost',
        port: 9199,
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it('disallows read access for unauthorized users', async () => {
    const storage = testEnv.unauthenticatedContext().storage();
    const { base, submitter, user, point } = getPaths(storage);

    await assertFails(getBytes(base));
    await assertFails(getBytes(submitter));
    await assertFails(getBytes(user));
    await assertFails(getBytes(point));
  });

  it('disallows write access for unauthorized users', async () => {
    const storage = testEnv.unauthenticatedContext().storage();
    const { submitter, user, point } = getPaths(storage);
    const message =
      'data:text/plain;base64, aSdtIGp1c3QgYSBwb29yIGJveSBib2R5IGxvdmVzIG1l';
    await assertFails(uploadString(submitter.parent, message));
    await assertFails(uploadString(user.parent, message));
    await assertFails(uploadString(point.parent, message));
  });

  it('disallows metadata access for unauthorized users', async () => {
    const storage = testEnv.unauthenticatedContext().storage();
    const { base, submitter, user, point } = getPaths(storage);

    await assertFails(listAll(base));
    await assertFails(listAll(submitter));
    await assertFails(listAll(user));
    await assertFails(listAll(point));
  });

  it('allows read access for authorized users to their folder', async () => {
    const storage = testEnv.authenticatedContext(userId).storage();
    const { base, submitter, user, point } = getPaths(storage);

    await assertFails(getBytes(base));
    await assertFails(getBytes(submitter));
    await assertSucceeds(getBytes(user));
    await assertSucceeds(getBytes(point));
  });

  it('disallows write access for authorized users to their folder when uploading non image file', async () => {
    const storage = testEnv.authenticatedContext(userId).storage();
    const { submitter, user, point } = getPaths(storage);
    const bytes = new Uint8Array([
      0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64,
      0x21,
    ]);
    const metadata = {
      contentType: 'text/plain',
    };

    await assertFails(
      uploadBytes(ref(storage, submitter.parent + '/test.txt'), bytes, metadata)
    );
    await assertFails(
      uploadBytes(ref(storage, user.parent + '/test.txt'), bytes, metadata)
    );
    await assertFails(
      uploadBytes(ref(storage, point.parent + '/test.txt'), bytes, metadata)
    );
  });

  it('allows write access for authorized users to their folder when uploading image files', async () => {
    const storage = testEnv.authenticatedContext(userId).storage();
    const bytes = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 5,
      0, 0, 0, 5, 8, 6, 0, 0, 0, 141, 111, 38, 229, 0, 0, 0, 28, 73, 68, 65, 84,
      8, 215, 99, 248, 255, 255, 63, 195, 127, 6, 32, 5, 195, 32, 18, 132, 208,
      49, 241, 130, 88, 205, 4, 0, 14, 245, 53, 203, 209, 142, 14, 31, 0, 0, 0,
      0, 73, 69, 78, 68, 174, 66, 96, 130,
    ]);
    const { submitter, user, point } = getPaths(storage);
    const metadata = {
      contentType: 'image/png',
    };

    await assertFails(
      uploadBytes(ref(storage, submitter.parent + '/test.png'), bytes, metadata)
    );
    await assertSucceeds(
      uploadBytes(ref(storage, user.parent + '/test.png'), bytes, metadata)
    );
    await assertSucceeds(
      uploadBytes(ref(storage, point.parent + '/test.png'), bytes, metadata)
    );
  });

  it('disallows deletes for authorized users to their folders', async () => {
    const storage = testEnv.authenticatedContext(userId).storage();
    const { submitter, user, point } = getPaths(storage);

    await assertFails(
      deleteObject(ref(storage, submitter.parent + '/test.png'))
    );
    await assertFails(deleteObject(ref(storage, user.parent + '/test.png')));
    await assertFails(deleteObject(ref(storage, point.parent + '/test.png')));
  });
});
