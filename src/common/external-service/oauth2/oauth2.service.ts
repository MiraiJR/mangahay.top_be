import { ApplicationException } from '@common/exception/application.exception';
import AuthError from '@modules/auth/resources/error/error';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class OAuth2Service {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.HOST_FE,
    );
  }

  async getGoogleUserProfile(authCode: string): Promise<UserProfileGoogle> {
    try {
      const { tokens } = await this.client.getToken(authCode);
      this.client.setCredentials(tokens);

      const userProfile = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      return userProfile.data;
    } catch (error) {
      throw new ApplicationException(AuthError.AUTH_ERROR_0008);
    }
  }
}
