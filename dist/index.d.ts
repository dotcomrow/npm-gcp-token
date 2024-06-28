export default class GCPAccessToken {
    private keyFileContent;
    private token;
    private tokenExpiry;
    constructor(keyFileContent: string);
    private createJWT;
    getAccessToken(scope: string): Promise<string>;
}
