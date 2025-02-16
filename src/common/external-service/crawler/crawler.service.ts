import { CanNotCrawlDataException } from '@common/exception/common/can-not-crawl-data.exception';
import CommonError from '@common/resources/error/error';
import { SystemDataRepository } from '@modules/system-data/system-data.repository';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { FacebookService } from '../facebook/facebook.service';

@Injectable()
export class CrawlerService {
  private readonly logger: Logger;
  constructor(
    private systemDataRepository: SystemDataRepository,
    private facebookService: FacebookService,
  ) {
    this.logger = new Logger(CrawlerService.name);
  }

  async crawlImagesFromLinkWebsite(
    urlPost: string,
    querySelector: string,
    attribute: string,
  ): Promise<string[]> {
    try {
      const { data: htmlResponse } = await axios.get(urlPost);
      const $ = cheerio.load(htmlResponse);
      const imgElements = $(querySelector);

      const srcAttributes = imgElements.map((_index, element) => $(element).attr(attribute)).get();

      if (urlPost.includes('blogtruyen')) {
        srcAttributes.shift();
        srcAttributes.pop();
      }

      return srcAttributes;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async crawlImagesFromFacebookPost(urlPost: string): Promise<string[]> {
    const convertedURL = new URL(urlPost);
    const pageId = convertedURL.searchParams.get('id');
    const postId = convertedURL.searchParams.get('story_fbid');
    const accessToken = await this.getFacebookToken();

    try {
      const images = await this.facebookService.getImagesFromPostOfSpecifiedPage(
        pageId,
        postId,
        accessToken,
      );
      return images;
    } catch (error) {
      if (error.code === 'ENOTFOUND') {
        throw new CanNotCrawlDataException({
          ...CommonError.COMMON_ERROR_0006,
          rootCause: error.message,
        });
      }

      const { code, type, error_subcode } = error.response.data.error;
      if (type === 'OAuthException' && code === 190 && error_subcode === 463) {
        const newFacebookToken = await this.facebookService.resetTokenWhenExpired(accessToken);
        await this.updateFacebookToken(newFacebookToken);
        return this.crawlImagesFromFacebookPost(urlPost);
      }

      return [];
    }
  }

  private async getFacebookToken() {
    const { value } = await this.systemDataRepository.getValueByKey('facebook_token');
    return value;
  }

  private async updateFacebookToken(newToken: string) {
    await this.systemDataRepository.updateValueByKey('facebook_token', newToken);
  }

  async crawlChapters(
    urlNeedCrawled: string,
    querySelectorChapterUrl: string,
    attributeChapterUrl: string,
    querySelectorChapterName: string,
  ): Promise<ChapterCrawler[]> {
    const hostName = new URL(urlNeedCrawled).hostname;
    const { data: htmlResponse } = await axios.get(urlNeedCrawled);
    const $ = cheerio.load(htmlResponse);
    const chapterElements = $(querySelectorChapterUrl);
    const chapterNameElements = $(querySelectorChapterName);

    const valueOfAttributeChapter: ChapterCrawler[] = [];

    for (let index = chapterElements.length - 1; index >= 0; index--) {
      const chapterUrl = $(chapterElements[index]).attr(attributeChapterUrl);
      const chapterName = $(chapterNameElements[index]).text();
      valueOfAttributeChapter.push({
        chapterUrl: chapterUrl.startsWith(`https://${hostName}`)
          ? chapterUrl
          : `https://${hostName}${chapterUrl}`,
        chapterName,
      });
    }

    return valueOfAttributeChapter;
  }
}
