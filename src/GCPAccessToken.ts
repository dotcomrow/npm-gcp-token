import { JWTHeaderParameters, JWTPayload, SignJWT, importPKCS8 } from 'jose'
// import * as https from "https"
import axios from 'axios';
import { Buffer } from 'buffer';
import AccessToken from './AccessToken.js';

interface ServiceAccountKey {
    client_email: string;
    private_key: string;
}

export default class GCPAccessToken {
    private keyFileContent: string;
    private token: AccessToken;

    constructor(keyFileContent: string) {
        this.keyFileContent = keyFileContent;
        this.token = new AccessToken('', 0, '');
    }

    private async createJWT(header: JWTHeaderParameters, payload: JWTPayload, privateKey: string): Promise<string> {
        const key = await importPKCS8(privateKey, 'RS256');
        return await new SignJWT(payload)
            .setProtectedHeader(header)
            .sign(key);
    }

    private httprequest(postData: string) {
        const reqBody = 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + postData;
        return axios.post('https://oauth2.googleapis.com/token', reqBody, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(reqBody)
            }
        }).then((res) => {
            return res.data;
        }).catch((err) => {
            console.log(err);
            return err;
        });
    }

    public async getAccessToken(scope: string): Promise<AccessToken> {
        if (this.token && this.token.isExpired() === false) {
            console.log('Using cached access token')
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

        const jwt = await this.createJWT(header, payload, keyFile.private_key)
        
        await this.httprequest(jwt).then((data: any) => {
            this.token = new AccessToken(data.access_token, data.expires_in, data.token_type);
        });

        return this.token;
    }
}
