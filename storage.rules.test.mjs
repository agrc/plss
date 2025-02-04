import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { Buffer } from 'buffer';
import { readFileSync } from 'fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

let testEnv;
const userId = 'user_abc';
const blmPoint = 'point_abc';
const contentType = 'image/png';

const loadImage = () => readFileSync('./tests/image.png');
const createMBImage = (mb) => Buffer.alloc(mb * 1024 * 1024);
const getPaths = (storage) => {
  return {
    submitterImage: storage.ref(`submitters/new`).child('submitterFolder.png'),
    submitter: storage.ref(`submitters/new`),
    userImage: storage.ref(`submitters/${userId}/new`).child('userFolder.png'),
    user: storage.ref(`submitters/${userId}/new`),
    pointImage: storage.ref(`submitters/${userId}/new/${blmPoint}`).child('pointFolder.png'),
    point: storage.ref(`submitters/${userId}/new/${blmPoint}`),
  };
};

describe('storage', () => {
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'test-project',
      storage: {
        rules: readFileSync('./storage.rules', 'utf8'),
        host: '127.0.0.1',
        port: 9199,
      },
    });

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const storage = context.storage();
      const { submitterImage, userImage, pointImage } = getPaths(storage);

      await submitterImage.put(loadImage(), { contentType });
      await userImage.put(loadImage(), { contentType });
      await pointImage.put(loadImage(), { contentType });
    });
  });

  beforeEach(async () => await testEnv.clearStorage());

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it('disallows read access for unauthorized users', async () => {
    const storage = testEnv.unauthenticatedContext().storage();
    const { submitterImage, userImage, pointImage } = getPaths(storage);

    await assertFails(submitterImage.getDownloadURL());
    await assertFails(userImage.getDownloadURL());
    await assertFails(pointImage.getDownloadURL());
  });

  it('disallows write access for unauthorized users', async () => {
    const storage = testEnv.unauthenticatedContext().storage();
    const { submitter, user, point } = getPaths(storage);

    await assertFails(submitter.child('test.png').put(loadImage(), { contentType }));
    await assertFails(user.child('test.png').put(loadImage(), { contentType }));
    await assertFails(point.child('test.png').put(loadImage(), { contentType }));
  });

  it('disallows metadata access for unauthorized users', async () => {
    const storage = testEnv.unauthenticatedContext().storage();
    const { submitter, user, point } = getPaths(storage);

    await assertFails(submitter.listAll());
    await assertFails(user.listAll());
    await assertFails(point.listAll());
  });

  it('allows read access for authorized users to their folder', async () => {
    const storage = testEnv.authenticatedContext(userId).storage();
    const { submitterImage, userImage, pointImage } = getPaths(storage);

    await assertFails(submitterImage.getDownloadURL());
    await assertSucceeds(userImage.getDownloadURL());
    await assertSucceeds(pointImage.getDownloadURL());
  });

  it('disallows write access for authorized users to their folder when uploading non image file', async () => {
    const storage = testEnv.authenticatedContext(userId).storage();
    const { submitter, user, point } = getPaths(storage);

    await assertFails(submitter.child('test.doc').put(loadImage(), { contentType: 'text/plain' }));
    await assertFails(user.child('test.doc').put(loadImage(), { contentType: 'text/plain' }));
    await assertFails(point.child('test.doc').put(loadImage(), { contentType: 'text/plain' }));
  });

  it('allows write access for authorized users to their folder when uploading image files', async () => {
    const storage = testEnv.authenticatedContext(userId).storage();
    const { submitter, user, point } = getPaths(storage);

    await assertFails(submitter.child('test.png').put(loadImage(), { contentType }));
    await assertFails(user.child('test.png').put(loadImage(), { contentType }));
    await assertSucceeds(point.child('test.png').put(loadImage(), { contentType }));
  });

  it('disallows files greater than 5MB', async () => {
    const storage = testEnv.authenticatedContext(userId).storage();

    const getRef = (submitter, imageName) => storage.ref(`submitters/${submitter}`).child(imageName);

    await assertFails(
      getRef(userId, 'big.png').put(createMBImage(5.1), {
        contentType,
      }),
    );
  });
});
