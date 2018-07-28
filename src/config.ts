import * as fs from 'fs';

if (!process.env.MAIL_CONFIG) {
  throw new Error('A MAIL_CONFIG environment variable does not exist.');
}

const config = JSON.parse(fs.readFileSync(process.env.MAIL_CONFIG).toString());
export default config;
