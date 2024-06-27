import axios from 'axios';
import fetchAdapter from "@haverstack/axios-fetch-adapter";
import { JWTHeaderParameters, JWTPayload, SignJWT, importPKCS8 } from 'jose';

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
}

class GCloudAuth {
  private keyFileContent: string;
  private token: string;
  private tokenExpiry: number | null;

  constructor(keyFileContent: string) {
    this.keyFileContent = keyFileContent;
    this.token = '';
    this.tokenExpiry = null;
  }

  private async createJWT(header: JWTHeaderParameters, payload: JWTPayload, privateKey: string): Promise<string> {
    const key = await importPKCS8(privateKey, 'RS256');
    return await new SignJWT(payload)
      .setProtectedHeader(header)
      .sign(key);
  }

  public async getAccessToken(scope: string): Promise<string> {
    if (this.token && this.tokenExpiry && this.tokenExpiry > Date.now()) {
      return this.token;
    }

    const keyFile: ServiceAccountKey = JSON.parse(this.keyFileContent);

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600; // 1 hour expiry

    const header: JWTHeaderParameters = {
      alg: 'RS256',
      typ: 'JWT',
    };
    
    // Add the 'alg' property to the header object
    header.alg = 'RS256';

    const payload = {
      iss: keyFile.client_email,
      sub: keyFile.client_email,
      scope: scope,
      aud: 'https://oauth2.googleapis.com/token',
      iat: iat,
      exp: exp,
    };

    const jwt = await this.createJWT(header, payload, keyFile.private_key);

    const client = axios.create({
      adapter: fetchAdapter
    });
    const response = await client.post('https://oauth2.googleapis.com/token', {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    });

    this.token = response.data.access_token;
    this.tokenExpiry = exp * 1000;

    return this.token;
  }
}

export default GCloudAuth;
