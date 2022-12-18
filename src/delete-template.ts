import path from 'path';
import readline from 'readline';
import fs from 'fs';
import SesService from './ses-service';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to display questions
const question = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

(async () => {
  const val = await question(
    'This script will DELETE an Amazon SES email template from your AWS account. Are you sure you want to continue? (Y/n) ',
  );
  const shouldContinue = val.length === 0 || val.toLowerCase() === 'y';

  if (!shouldContinue) return rl.close();

  const name = await question('Enter template name ');

  try {
    // Remove .json file
    const jsonDir = `${__dirname}/../src/json`;
    const jsonPath = `${jsonDir}/${name}.json`;
    fs.unlinkSync(path.resolve(jsonPath));

    // Remove SES template
    const service = new SesService();
    const result = await service.deleteTemplate(name);

    console.log(result);

    rl.close();
  } catch (e) {
    console.log(e);
    rl.close();
  }
})();
