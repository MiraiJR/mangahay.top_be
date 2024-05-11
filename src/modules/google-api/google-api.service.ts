import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import * as key from './json/raicy0222-cb718c7c3581.json';
import { JWT } from 'google-auth-library';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EnvironmentUtil } from 'src/common/utils/EnvironmentUtil';

const ENDPOINT_INDEXING: string = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
const GOOGLE_INDEXING_AUTH: string = 'https://www.googleapis.com/auth/indexing';

@Injectable()
export class GoogleApiService {
  private logger: Logger;
  constructor(private readonly httpService: HttpService) {
    this.logger = new Logger(GoogleApiService.name);
  }

  createJwtClient(): JWT {
    return new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      [GOOGLE_INDEXING_AUTH],
      null,
    );
  }

  async indexingUrl(url: string): Promise<void> {
    if (EnvironmentUtil.isDevMode()) {
      return;
    }

    try {
      const jwtClient = this.createJwtClient();
      const tokens = await jwtClient.authorize();

      await firstValueFrom(
        this.httpService.post<any>(
          ENDPOINT_INDEXING,
          {
            url,
            type: 'URL_UPDATED',
          },
          {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.log(`Hệ thống đã gửi request indexing cho đường dẫn: ${url} thành công!`);
    } catch (error) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
