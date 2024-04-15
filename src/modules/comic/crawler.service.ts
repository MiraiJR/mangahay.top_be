import { HttpService } from '@nestjs/axios';
import { InjectQueue } from '@nestjs/bull';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Queue } from 'bull';
import * as cheerio from 'cheerio';

@Injectable()
export class CrawlerService {
  private readonly logger: Logger;
  constructor(private httpService: HttpService, private configService: ConfigService) {
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
      console.log(error);
    }
  }

  async crawlImagesFromFacebookPost(urlPost: string): Promise<string[]> {
    const convertedURL = new URL(urlPost);
    const pageId = convertedURL.searchParams.get('id');
    const postId = convertedURL.searchParams.get('story_fbid');
    const accessToken = this.configService.get<string>('FACEBOOK_TOKEN');

    const { data } = await this.httpService
      .get(
        `https://graph.facebook.com/v18.0/${pageId}_${postId}?fields=attachments{subattachments.limit(100)}&access_token=${accessToken}`,
      )
      .toPromise();

    if (data.attachments === undefined) {
      throw new HttpException('Cannot crawl data from this link!', HttpStatus.BAD_REQUEST);
    }

    const images: string[] = [];
    data.attachments.data[0].subattachments.data.map((ele: any) => {
      images.push(ele.media.image.src);
    });

    return images;
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
    const chatperElements = $(querySelectorChapterUrl);
    const valueOfAttributeChapter: ChapterCrawler[] = chatperElements
      .map((_index, chapterElement) => {
        const chapterUrl = $(chapterElement).attr(attributeChapterUrl);

        let chapterName = '';
        if (querySelectorChapterName === querySelectorChapterUrl) {
          chapterName = $(chapterElement).text();
        } else {
          chapterName = $(chapterElement).find(querySelectorChapterName).text();
        }

        return {
          chapterUrl: chapterUrl.startsWith(`https://${hostName}`)
            ? chapterUrl
            : `https://${hostName}${chapterUrl}`,
          chapterName,
        };
      })
      .get();

    return valueOfAttributeChapter;
  }
}
