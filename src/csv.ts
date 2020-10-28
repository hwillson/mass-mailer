import * as csv from "csvtojson";

interface IEmail {
  email: string;
  language?: string;
  content1?: string;
  content2?: string;
  content3?: string;
  content4?: string;
  content5?: string;
  content6?: string;
  content7?: string;
  content8?: string;
  content9?: string;
  content10?: string;
  content11?: string;
  content12?: string;
  subject1?: string;
}

export async function loadCsvFromFile(csvFilename: string) {
  let loadedCsv: IEmail[];
  try {
    loadedCsv = await csv().fromFile(csvFilename);
  } catch (error) {
    throw new Error(`Unable to load CSV file "${csvFilename}": ${error}`);
  }

  if (!loadedCsv) {
    throw new Error("The CSV file is empty");
  }

  return loadedCsv;
}
