import * as csv from 'csvtojson';

interface IEmail {
  email: string;
}

const loadCsvFromFile = async (csvFilename: string) => {
  let loadedCsv: IEmail[];
  try {
    loadedCsv = await csv({
      headers: ['email'],
      noheader: true,
    }).fromFile(csvFilename);
  } catch (error) {
    throw new Error(`Unable to load CSV file "${csvFilename}": ${error}`);
  }

  if (!loadedCsv) {
    throw new Error('The CSV file is empty');
  }

  return loadedCsv;
};

export { loadCsvFromFile };
