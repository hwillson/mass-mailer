# mass-mailer

Quick custom mass mailer. Extracts a list of email addresses from a CSV, then
sends the specified email content to each email address. Emails are sent
using [mailgun](https://www.mailgun.com).

## Usage

1. Make sure you have a CSV file with a `email` column header, and a row for each email address you want to send the email to.

Options:

- You can include up to 2 additional columns for content that can be dynamically injected into your email template. These columns should be called `content1` and `content2`.
- You can include 1 additional column for content that can be dynamically injected into your email subject line. This column should be called `subject1`.
- You can optionally include a `language` column that contains ISO 639-1 based two-letter language codes. These will then be used to load language specific details from your config file.

Example CSV header:

```
"email","language","content1","content2","subject1"
```

2. Create an HTML file to contain your email body. If you're supporting multiple languages, create an HTML file for each language. If you're supplying `content1` / `content2` columns in your CSV for dynamic replacement, you can use `{CONTENT1}` / `{CONTENT2}` placeholders in your HTML file. These values will be replaced at runtime.

3. Create a JSON config file based on `./settings-sample.json`. Make sure the CSV from #1 is configured via `csv.path`, and the HTML file(s) from #2 are configured via `csv.email.htmlFile`.

4. Ensure the email `subject` and optional `attachment` are defined in the config file. If you're providing a `subject1` column in your CSV, you can use `{SUBJECT1}` in your subject line, to have it replaced dynamically at runtime.

5. Create a `MAIL_CONFIG` environment variable with the config file path.

6. Run as `MAIL_CONFIG=/your/config.json node dist/index.js`
