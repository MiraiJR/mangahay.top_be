import slugify from 'slugify';
import StringUtil from '../utils/StringUtil';

export const customSlugify = (text: string): string => {
  text = text.toLowerCase();
  text = StringUtil.removeAccents(text);

  // convert đ to d
  const customReplacements: { [key: string]: string } = {
    đ: 'd',
  };

  text = text.replace(/[đĐ]/g, (match) => customReplacements[match]);

  text = text.replace(/[:\-+]/g, '');

  // remove all special case
  const regex = /[^a-zA-Z0-9 ]/g;
  text = text.replace(regex, '');

  return slugify(text, { lower: true, trim: true });
};
