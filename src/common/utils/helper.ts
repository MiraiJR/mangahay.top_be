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
};

export default Helper;
