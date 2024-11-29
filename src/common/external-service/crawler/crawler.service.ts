import { ApplicationException } from '@common/exception/application.exception';
import ComicError from '@modules/comic/resources/error/error';
import { SystemDataRepository } from '@modules/system-data/system-data.repository';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class CrawlerService {
  private readonly logger: Logger;
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private systemDataRepository: SystemDataRepository,
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
      const { data } = await this.httpService
        .get(
          `https://graph.facebook.com/v21.0/${pageId}_${postId}?fields=attachments{subattachments.limit(100)}&access_token=${accessToken}`,
        )
        .toPromise();

      if (data.attachments === undefined) {
        throw new ApplicationException(ComicError.CRAWLER_CHAPTER_ERROR_0001);
      }

      const images: string[] = [];
      data.attachments.data[0].subattachments.data.map((ele: any) => {
        images.push(ele.media.image.src);
      });

      return images;
    } catch (error) {
      console.log(error.response);
      const { code, type, error_subcode } = error.response.data.error;
      if (type === 'OAuthException' && code === 190 && error_subcode === 463) {
        const newFacebookToken = await this.resetTokenWhenExpired();
        await this.updateFacebookToken(newFacebookToken);
        return this.crawlImagesFromFacebookPost(urlPost);
      }

      return [];
    }
  }

  private async resetTokenWhenExpired() {
    const url = 'https://graph.facebook.com/oauth/access_token';
    const { data } = await axios.get(url, {
      params: {
        client_id: this.configService.get<string>('APP_FACEBOOK_ID'),
        client_secret: this.configService.get<string>('APP_FACEBOOK_SECRET'),
        grant_type: 'client_credentials',
      },
    });

    return data.access_token;
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
