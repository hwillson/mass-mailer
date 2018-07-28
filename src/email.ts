import * as mailgunJs from 'mailgun-js';

import config from './config';

const mailgun = mailgunJs({
  apiKey: config.mailgun.apiKey,
  domain: config.mailgun.domain,
});

interface ISendData {
  attachment?: string | Buffer | NodeJS.ReadWriteStream;
  from?: string;
  to: string | string[];
  subject?: string;
  html?: string;
  text?: string;
}

function sendEmail({
  attachment,
  from = config.mailgun.from,
  html,
  subject,
  text,
  to,
}: ISendData) {
  if (!to || !subject) {
    throw new Error('Missing mandatory email data');
  }

  return new Promise((resolve, reject) => {
    mailgun.messages().send(
      { attachment, from, html, subject, to, text },
      (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      },
    );
  });
}

interface IBouncedRecord {
  address: string;
  code: string;
  error: string;
  created_at: string;
  MessageHash: string;
}

interface IBouncedResponse {
  items: IBouncedRecord[];
  paging: object;
}

async function getBouncedEmails() {
  const data = await new Promise<IBouncedResponse>((resolve, reject) => {
    mailgun.get(
      `/${config.mailgun.domain}/bounces?limit=1000`,
      (error: object, response: object) => {
        if (error) {
          reject(error);
        } else {
          resolve(response as IBouncedResponse);
        }
      },
    );
  });

  let bouncedEmails;
  if (data && data.items) {
    bouncedEmails = data.items.map((item: IBouncedRecord) => item.address);
  }

  return bouncedEmails;
}

export { sendEmail, getBouncedEmails };
