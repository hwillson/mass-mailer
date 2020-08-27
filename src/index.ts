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
    const { email: to, content1, content2, subject1 } = record;
    const lang = record.language || "en";
    const response = await sendEmail({
      attachment: config.email.attachment && config.email.attachment[lang],
      html: html[lang]
        .replace("{CONTENT1}", content1)
        .replace("{CONTENT2}", content2),
      subject: config.email.subject[lang].replace("{SUBJECT1}", subject1),
      to,
      language: lang,
      from: config.mailgun.from[lang],
    });
    console.log(`${count}: emailed "${to}" ...`);
    await sleep(1000);
    count += 1;
  }

  console.log("Emailing finished.");
})();
