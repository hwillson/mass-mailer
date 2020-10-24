import * as fs from "fs";
import sleep from "./sleep";

import config from "./config";
import { loadCsvFromFile } from "./csv";
import { sendEmail } from "./email";

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
      subject1,
    } = record;
    const lang = record.language || "en";
    try {
      await sendEmail({
        attachment: config.email.attachment && config.email.attachment[lang],
        html: html[lang]
          .replace(/{CONTENT1}/g, content1)
          .replace(/{CONTENT2}/g, content2)
          .replace(/{CONTENT3}/g, content3)
          .replace(/{CONTENT4}/g, content4)
          .replace(/{CONTENT5}/g, content5)
          .replace(/{CONTENT6}/g, content6)
          .replace(/{CONTENT7}/g, content7)
          .replace(/{CONTENT8}/g, content8),
        subject: config.email.subject[lang].replace("{SUBJECT1}", subject1),
        to,
        language: lang,
        from: config.mailgun.from[lang],
      });
      console.log(`${count}: emailed "${to}" ...`);
    } catch (error) {
      console.log(error);
    }
    await sleep(1000);
    count += 1;
  }

  console.log("Emailing finished.");
})();
