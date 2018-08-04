import * as fs from 'fs';
import sleep from './sleep';

import config from './config';
import { loadCsvFromFile } from './csv';
import { sendEmail } from './email';
// import { sendEmail, getBouncedEmails } from './email';

console.log('Emailing started ...');

(async () => {
  // Load email addresses from the CSV.
  const csv = await loadCsvFromFile(config.csv.path);

  // Load email content.
  const html = fs.readFileSync(config.email.htmlFile).toString();

  // Send an email to each address, with the specified delay between sends.
  let count = 1;
  for (const record of csv) {
    const to = record.email;
    const response = await sendEmail({
      attachment: config.email.attachment,
      html,
      subject: config.email.subject,
      to,
    });
    console.log(`${count}: emailed "${to}" ...`);
    await sleep(3000);
    count += 1;
  }

  console.log('Emailing finished.');
})();

// (async () => {
//   const bouncedEmails = await getBouncedEmails();
//   console.log(bouncedEmails);
// })();
