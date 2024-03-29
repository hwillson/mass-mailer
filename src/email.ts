import * as mailgunJs from "mailgun-js";
import { writeFileSync } from "fs";

import config from "./config";

export interface ISendData {
  attachment?: string | Buffer | NodeJS.ReadWriteStream | string[];
  from?: string;
  to: string | string[];
  subject?: string;
  html?: string;
  text?: string;
  language: string;
  tags?: string[];
  cc?: string | string[];
  bcc?: string | string[];
}

export function sendEmail({
  attachment,
  from = config.mailgun.from.en,
  html,
  subject,
  text,
  to,
  language = "en",
  tags,
  cc,
  bcc,
}: ISendData) {
  if (!to || !subject) {
    throw new Error("Missing mandatory email data");
  }

  const mailgun = mailgunJs({
    apiKey: config.mailgun.apiKey,
    domain: config.mailgun.domain[language],
  });

  const options = {
    attachment,
    from,
    html,
    subject,
    to,
    text,
    "o:tag": tags,
  } as any;

  if (cc) {
    options.cc = cc;
  }

  if (bcc) {
    options.bcc = bcc;
  }

  return new Promise((resolve, reject) => {
    mailgun.messages().send(options, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
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
  paging: Record<string, any>;
}

async function nextBouncedEmails({
  url,
  language = "en",
  bouncedEmails = [],
}: {
  url?: string;
  language?: string;
  bouncedEmails: string[];
}) {
  const mailgun = mailgunJs({
    apiKey: config.mailgun.apiKey,
    domain: config.mailgun.domain[language],
  });

  const mailgunUrl =
    url || `/${config.mailgun.domain[language]}/bounces?limit=1000`;

  const data = await new Promise<IBouncedResponse>((resolve, reject) => {
    mailgun.get(mailgunUrl, (error: object, response: object) => {
      if (error) {
        reject(error);
      } else {
        resolve(response as IBouncedResponse);
      }
    });
  });

  if (data) {
    if (data.items) {
      data.items.forEach((item: IBouncedRecord) => {
        bouncedEmails.push(item.address);
      });
    }

    if (data.paging && data.paging.next) {
      const nextUrl = data.paging.next.replace(
        "https://api.mailgun.net/v3",
        ""
      );
      if (nextUrl.includes("page=next")) {
        await nextBouncedEmails({ url: nextUrl, bouncedEmails });
      }
    }
  }
}

export async function getBouncedEmails(language = "en") {
  const bouncedEmails: string[] = [];
  await nextBouncedEmails({ bouncedEmails, language });
  console.log(bouncedEmails);
  writeFileSync("/tmp/bounces.json", JSON.stringify(bouncedEmails, null, 2));
}

interface IClickRecord {
  event: string;
  recipient: string;
}

interface IClickResponse {
  items: IClickRecord[];
  paging: {
    next: string;
  };
}

function fetchClickRecords(uri?: string, language = "en") {
  const mailgun = mailgunJs({
    apiKey: config.mailgun.apiKey,
    domain: config.mailgun.domain[language],
  });

  return new Promise<IClickResponse>((resolve, reject) => {
    mailgun.get(
      `${uri}?limit=300&event=clicked` +
        (config.mailgun.tags ? `&tags=${config.mailgun.tags.join(",")}` : ""),
      (error: object, response: object) => {
        if (error) {
          reject(error);
        } else {
          resolve(response as IClickResponse);
        }
      }
    );
  });
}

export async function exportClickEmails(language = "en") {
  const emails = new Set<string>();

  let next = `/${config.mailgun.domain[language]}/events`;
  while (next) {
    const data = await fetchClickRecords(next);
    if (data && data.items && data.items.length > 0) {
      data.items.forEach((item: IClickRecord) => {
        if (item.event === "clicked") {
          emails.add(item.recipient);
        }
      });

      next = data.paging.next
        ? data.paging.next.split("https://api.mailgun.net/v3")[1]
        : undefined;
    } else {
      next = undefined;
    }
  }

  const emailArray = Array.from(emails);
  writeFileSync("/tmp/clicks.json", JSON.stringify(emailArray, null, 2));

  return emailArray;
}
