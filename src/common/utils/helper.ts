import * as fs from 'fs';

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

export default Helper;
