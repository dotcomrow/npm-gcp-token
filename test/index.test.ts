import { GCPAccessToken } from '../src/index.js';
import * as fs from 'fs';

const keyFilePath = '/Users/admin/Downloads/org-service-accounts-401323-6ec6fc1915ca.json'; // replace with the path to your service account key file
const keyFileContent = fs.readFileSync(keyFilePath, 'utf8');

var accessToken = new GCPAccessToken(keyFileContent);
var token = await accessToken.getAccessToken('email');
console.log(token);
