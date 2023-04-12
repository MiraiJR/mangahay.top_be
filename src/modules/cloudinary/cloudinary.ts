import { v2 } from 'cloudinary';
import { cloudinary_config } from 'src/common/configs/cloudinary.config';

export const CloudinaryProvider = {
  provide: 'Cloudinary',
  useFactory: (): void => {
    v2.config(cloudinary_config);
  },
};
