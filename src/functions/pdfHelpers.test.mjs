import { describe, expect, test } from 'vitest';
import { splitImagesFromPdfs } from './pdfHelpers.mjs';

describe('pdfHelpers', () => {
  describe('splitImagesFromPdfs', () => {
    test('should remove all empty paths', () => {
      expect(
        splitImagesFromPdfs({
          map: '',
          monument: '',
          closeUp: '',
          extra1: '',
          extra2: '',
          extra3: '',
          extra4: '',
          extra5: '',
          extra6: '',
          extra7: '',
          extra8: '',
          extra9: '',
          extra10: '',
        })
      ).toEqual({
        imagePaths: {},
        pdfPaths: {},
      });
    });
    test('should find images and remove empty paths', () => {
      expect(
        splitImagesFromPdfs({
          map: 'map.png',
          monument: 'monument.jpg',
          closeUp: 'closeUp.png',
          extra1: '',
          extra2: '',
          extra3: '',
          extra4: '',
          extra5: '',
          extra6: '',
          extra7: '',
          extra8: '',
          extra9: '',
          extra10: '',
        })
      ).toEqual({
        imagePaths: {
          map: 'map.png',
          monument: 'monument.jpg',
          closeUp: 'closeUp.png',
        },
        pdfPaths: {},
      });
    });
    test('should find pdfs and remove empty paths', () => {
      expect(
        splitImagesFromPdfs({
          map: 'map.png',
          monument: 'monument.jpg',
          closeUp: 'closeUp.png',
          extra1: 'extra1.pdf',
          extra2: '',
          extra3: '',
          extra4: '',
          extra5: '',
          extra6: '',
          extra7: '',
          extra8: '',
          extra9: '',
          extra10: '',
        })
      ).toEqual({
        imagePaths: {
          map: 'map.png',
          monument: 'monument.jpg',
          closeUp: 'closeUp.png',
        },
        pdfPaths: {
          extra1: 'extra1.pdf',
        },
      });
    });
    test('should remove pdfs that are not extra files', () => {
      expect(
        splitImagesFromPdfs({
          map: 'map.png',
          monument: 'monument.jpg',
          closeUp: 'closeUp.pdf',
          extra1: 'extra1.pdf',
          extra2: '',
          extra3: '',
          extra4: '',
          extra5: '',
          extra6: '',
          extra7: '',
          extra8: '',
          extra9: '',
          extra10: '',
        })
      ).toEqual({
        imagePaths: {
          map: 'map.png',
          monument: 'monument.jpg',
        },
        pdfPaths: {
          extra1: 'extra1.pdf',
        },
      });
    });
  });
});
