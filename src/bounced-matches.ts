import { writeFileSync } from "fs";
import config from "./config";
import { getBouncedEmails } from "./email";
import { loadCsvFromFile } from "./csv";

(async () => {
  // Fetch bounced emails from Mailgun
  const bouncedEmails = await getBouncedEmails();
  const bouncedSet = new Set(bouncedEmails.map((e) => e.toLowerCase().trim()));

  // Load the campaign CSV
  const csvRecords = await loadCsvFromFile(config.csv.path);

  // Find CSV rows whose email appears in the bounced list
  const matches = csvRecords.filter((record) =>
    bouncedSet.has(record.email.toLowerCase().trim())
  );

  if (matches.length === 0) {
    console.log("No bounced emails found in CSV.");
    return;
  }

  // Write matched email addresses to /tmp/bounces.csv
  writeFileSync("/tmp/bounces.csv", matches.map((r) => r.email.trim()).join("\n"));
  console.log(
    `Found ${matches.length} bounced email(s). Written to /tmp/bounces.csv`
  );
})();
