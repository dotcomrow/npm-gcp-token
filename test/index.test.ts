import { GCPAccessToken } from '../src/index.js';
import * as fs from 'fs';

const keyFilePath = '/Users/admin/Downloads/logging-test-key.json'; // replace with the path to your service account key file
const keyFileContent = fs.readFileSync(keyFilePath, 'utf8');

var accessToken = new GCPAccessToken(keyFileContent);
var token = await accessToken.getAccessToken('https://www.googleapis.com/auth/logging.write');
console.log(token);
