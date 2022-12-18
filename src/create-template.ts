import path from 'path';
import readline from 'readline';
import fs from 'fs';
import { Template, AlreadyExistsException } from '@aws-sdk/client-ses';
import mjml2html from 'mjml';
import { convert } from 'html-to-text';
import SesService from './ses-service';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

const writeJsonTemplateFile = (templateName: string, template: Template) => {
  const jsonDir = `${__dirname}/../src/json`;
  const jsonPath = `${jsonDir}/${templateName}.json`;
  // If the json directory does not yet exist, then create it
  if (!fs.existsSync(path.resolve(jsonDir)))
    fs.mkdirSync(path.resolve(jsonDir));

  fs.writeFileSync(path.resolve(jsonPath), JSON.stringify(template));
};

(async () => {
  const val = await question(
    'This script will create an Amazon SES email template to be used with the SES service. Are you sure you want to continue? (Y/n) ',
  );
  const shouldContinue = val.length === 0 || val.toLowerCase() === 'y';

  if (!shouldContinue) return rl.close();

  const mjmlpath = await question(
    'Enter .mjml file path relative to "src/mjml" directory, including extension ',
  );
  const subject = await question('Enter subject line ');

  console.log(`Will generate template from '${mjmlpath}'`);
  console.log(`Template's subject line will be '${subject}'`);

  const mjMail = fs.readFileSync(
    path.join(__dirname, 'mjml', mjmlpath),
    'utf8',
  );
  const { html } = mjml2html(mjMail);
  const text = convert(html, {
    wordwrap: 130,
  });

  const templateName = path.basename(mjmlpath, '.mjml');

  console.log(`Will create a template with name of '${templateName}'`);

  const template: Template = JSON.parse(
    JSON.stringify({
      TemplateName: templateName,
      SubjectPart: subject,
      HtmlPart: html,
      TextPart: text,
    }),
  );

  const service = new SesService();

  try {
    const result = await service.createTemplate(template);

    console.log(result);

    writeJsonTemplateFile(templateName, template);

    rl.close();
  } catch (e) {
    if (e instanceof AlreadyExistsException) {
      const doUpdate = await question(
        'Template already exists. Update? (Y/n) ',
      );
      const shouldDoUpdate =
        doUpdate.length === 0 || doUpdate.toLowerCase() === 'y';

      if (!shouldDoUpdate) return rl.close();

      const result = await service.updateTemplate(template);

      console.log(result);

      writeJsonTemplateFile(templateName, template);

      rl.close();
    } else throw e;
  }
})();
