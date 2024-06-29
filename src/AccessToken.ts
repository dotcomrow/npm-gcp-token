export default class AccessToken {
    public access_token: string;
    public expires_in: number;
    public token_type: string = 'Bearer';

    constructor(token: string, expires: number, token_type: string) {
        this.access_token = token;
        this.expires_in = expires;
        this.token_type = token_type;
    }

    public isExpired(): boolean {
        return Date.now() >= this.expires_in;
    }
}