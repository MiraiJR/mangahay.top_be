import { customSlugify } from '@common/configs/slugify.config';
import * as fs from 'fs';
var uniqueSlug = require('unique-slug');

const Helper = {
  async createNewFolder(folderPath: string) {
    fs.access(folderPath, fs.constants.F_OK, (err) => {
      if (!err) {
        return;
      } else {
        fs.mkdirSync(folderPath, { recursive: true });
      }
    });
  },

  sortArrayImages(images: string[]): string[] {
    const sortedFileNames = images.sort((a: string, b: string) => {
      const aFileName = a.split('/')[a.split('/').length - 1];
      const bFileName = b.split('/')[b.split('/').length - 1];
      const aNum = parseInt(aFileName.split('.')[0]);
      const bNum = parseInt(bFileName.split('.')[0]);

      return aNum - bNum;
    });

    return sortedFileNames;
  },
};

export const buildImageUrl = (relativePath?: string) => {
  if (!relativePath) {
    return '';
  }

  if (relativePath.startsWith('https://')) {
    return relativePath;
  }

  return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${relativePath}`;
};

export const buildSlug = (name: string): string => {
  return `${customSlugify(name)}`;
};

export const removeArrayFieldOfObject = <T>(objectRoot: T, fields: Array<keyof T>) => {
  fields.forEach((field) => {
    delete objectRoot[field];
  });
};

export const randomUniqueString = (): string => {
  return uniqueSlug();
};

export default Helper;
