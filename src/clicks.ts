import { exportClickEmails } from "./email";

(async () => {
  const emails = await exportClickEmails();
  console.log(emails);
})();
