import { Injectable } from '@nestjs/common';
import { FacebookApi } from './constant';
import { ApplicationException } from '@common/exception/application.exception';
import CommonError from '@common/resources/error/error';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookService {
  constructor(private readonly configService: ConfigService) {}

  async getImagesFromPostOfSpecifiedPage(pageId: string, postId: string, accessToken: string) {
    const { data } = await axios.get(
      `${FacebookApi.baseUrl}/${FacebookApi.version}/${pageId}_${postId}?fields=attachments{subattachments.limit(100)}&access_token=${accessToken}`,
    );

    if (data.attachments === undefined) {
      throw new ApplicationException(CommonError.COMMON_ERROR_0006);
    }

    const images: string[] = [];
    data.attachments.data[0].subattachments.data.map((ele: any) => {
      images.push(ele.media.image.src);
    });

    return images;
  }

  async resetTokenWhenExpired(oldToken: string) {
    const { data } = await axios.get(`${FacebookApi.baseUrl}/oauth/access_token`, {
      params: {
        client_id: this.configService.get<string>('APP_FACEBOOK_ID'),
        client_secret: this.configService.get<string>('APP_FACEBOOK_SECRET'),
        grant_type: 'fb_exchange_token',
        fb_exchange_token: oldToken,
      },
    });

    return data.access_token;
  }
}
