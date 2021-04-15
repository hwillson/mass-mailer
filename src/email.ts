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
}: ISendData) {
  if (!to || !subject) {
    throw new Error("Missing mandatory email data");
  }

  const mailgun = mailgunJs({
    apiKey: config.mailgun.apiKey,
    domain: config.mailgun.domain[language],
  });

  return new Promise((resolve, reject) => {
    mailgun
      .messages()
      .send(
        { attachment, from, html, subject, to, text, "o:tag": tags } as any,
        (error, response) => {
          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        }
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

export async function getBouncedEmails(language = "en") {
  const mailgun = mailgunJs({
    apiKey: config.mailgun.apiKey,
    domain: config.mailgun.domain[language],
  });

  const data = await new Promise<IBouncedResponse>((resolve, reject) => {
    mailgun.get(
      `/${config.mailgun.domain[language]}/bounces?limit=100000`,
      (error: object, response: object) => {
        if (error) {
          reject(error);
        } else {
          resolve(response as IBouncedResponse);
        }
      }
    );
  });

  const bouncedEmails: string[] = [];
  if (data && data.items) {
    data.items.forEach((item: IBouncedRecord) => {
      const year = new Date(item.created_at).getFullYear();
      if (year === 2021) bouncedEmails.push(item.address);
      bouncedEmails.push(item.address);
    });
  }

  writeFileSync("/tmp/bounces.json", JSON.stringify(bouncedEmails, null, 2));

  return bouncedEmails;
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
