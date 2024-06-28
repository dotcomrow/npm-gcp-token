"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const axios_fetch_adapter_1 = __importDefault(require("@haverstack/axios-fetch-adapter"));
const jose_1 = require("jose");
class GCPAccessToken {
    constructor(keyFileContent) {
        this.keyFileContent = keyFileContent;
        this.token = '';
        this.tokenExpiry = null;
    }
    createJWT(header, payload, privateKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = yield (0, jose_1.importPKCS8)(privateKey, 'RS256');
            return yield new jose_1.SignJWT(payload)
                .setProtectedHeader(header)
                .sign(key);
        });
    }
    getAccessToken(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.token && this.tokenExpiry && this.tokenExpiry > Date.now()) {
                return this.token;
            }
            const keyFile = JSON.parse(this.keyFileContent);
            const iat = Math.floor(Date.now() / 1000);
            const exp = iat + 3600; // 1 hour expiry
            const header = {
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
            const jwt = yield this.createJWT(header, payload, keyFile.private_key);
            const client = axios_1.default.create({
                adapter: axios_fetch_adapter_1.default
            });
            const response = yield client.post('https://oauth2.googleapis.com/token', {
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: jwt,
            });
            this.token = response.data.access_token;
            this.tokenExpiry = exp * 1000;
            return this.token;
        });
    }
}
exports.default = GCPAccessToken;
