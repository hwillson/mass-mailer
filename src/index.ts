import * as fs from "fs";
import sleep from "./sleep";

import config from "./config";
import { loadCsvFromFile } from "./csv";
import { sendEmail, ISendData } from "./email";

console.log("Emailing started ...");

(async () => {
  // Load email addresses from the CSV.
  const csv = await loadCsvFromFile(config.csv.path);

  // Load email content.
  const html: Record<string, string> = {};
  Object.keys(config.email.htmlFile).forEach((lang) => {
    html[lang] = fs.readFileSync(config.email.htmlFile[lang]).toString();
  });

  // Send an email to each address, with the specified delay between sends.
  let count = 1;
  for (const record of csv) {
    const {
      email: to,
      content1,
      content2,
      content3,
      content4,
      content5,
      content6,
      content7,
      content8,
      content9,
      content10,
      content11,
      content12,
      subject1,
    } = record;
    const lang = record.language || "en";
    try {
      const params: ISendData = {
        attachment: config.email.attachment && config.email.attachment[lang],
        html: html[lang]
          .replace(/{EMAIL}/g, to)
          .replace(/{CONTENT1}/g, content1)
          .replace(/{CONTENT2}/g, content2 || "N/A")
          .replace(/{CONTENT3}/g, content3 || "N/A")
          .replace(/{CONTENT4}/g, content4 || "N/A")
          .replace(/{CONTENT5}/g, content5 || "N/A")
          .replace(/{CONTENT6}/g, content6 || "N/A")
          .replace(/{CONTENT7}/g, content7 || "N/A")
          .replace(/{CONTENT8}/g, content8)
          .replace(/{CONTENT9}/g, content9)
          .replace(/{CONTENT10}/g, content10)
          .replace(/{CONTENT11}/g, content11)
          .replace(/{CONTENT12}/g, content12),
        subject: config.email.subject[lang].replace("{SUBJECT1}", subject1),
        to,
        language: lang,
        from: config.mailgun.from[lang],
      };

      if (config.mailgun.tags) {
        params.tags = config.mailgun.tags;
      }

      await sendEmail(params);
      console.log(`${count}: emailed "${to}" ...`);
    } catch (error) {
      console.log(error);
    }
    // await sleep(1000);
    await sleep(500);
    count += 1;
  }

  console.log("Emailing finished.");
})();
