import slugify from 'slugify';
import StringUtil from '../utils/StringUtil';
var uniqueSlug = require('unique-slug');

export const customSlugify = (text: string): string => {
  text = StringUtil.removeAccents(text);

  const customReplacements: { [key: string]: string } = {
    đ: 'd',
    Đ: 'd',
  };
  text = text.replace(/[đĐ]/g, (match) => customReplacements[match]);

  text = text.replace(/[:/\\\-+]/g, '').replace(/[^a-zA-Z0-9 ]/g, '');

  const slugBase = slugify(text, { lower: true, trim: true, strict: true });
  return `${slugBase}-${uniqueSlug()}`;
};
