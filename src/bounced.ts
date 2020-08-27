import { getBouncedEmails } from "./email";

(async () => {
  const bouncedEmails = await getBouncedEmails();
  console.log(bouncedEmails);
})();
