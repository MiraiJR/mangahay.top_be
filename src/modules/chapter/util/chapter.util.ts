import { Injectable } from '@nestjs/common';
import { Chapter } from '../chapter.entity';
import { buildImageUrl } from '@common/utils/helper';

@Injectable()
export class ChapterUtilService {
  constructor() {}

  convertImagesOfChapterWithHostS3(chapter: Chapter) {
    const convertedImages = chapter.images.map((image) => {
      return {
        ...image,
        relativePath: buildImageUrl(image.relativePath),
      };
    });

    return {
      ...chapter,
      images: convertedImages,
    };
  }
}
