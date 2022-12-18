import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
  SendEmailCommandOutput,
  Template,
  CreateTemplateCommand,
  SendTemplatedEmailCommandInput,
  SendTemplatedEmailCommand,
  DeleteTemplateCommand,
  UpdateTemplateCommand,
} from '@aws-sdk/client-ses';

export default class SesService {
  public sesClient: SESClient;

  constructor() {
    this.sesClient = new SESClient({
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'AWS_API_ACCESS_KEY_ID',
        secretAccessKey: 'AWS_API_SECRET_ACCESS_KEY',
      },
    });
  }

  public send(params: SendEmailCommandInput): Promise<SendEmailCommandOutput> {
    return this.sesClient.send(new SendEmailCommand(params));
  }

  public createTemplate(template: Template) {
    return this.sesClient.send(
      new CreateTemplateCommand({
        Template: template,
      }),
    );
  }

  public updateTemplate(template: Template) {
    return this.sesClient.send(
      new UpdateTemplateCommand({
        Template: template,
      }),
    );
  }

  public sendWithTemplate(
    params: SendTemplatedEmailCommandInput,
  ): Promise<SendEmailCommandOutput> {
    return this.sesClient.send(new SendTemplatedEmailCommand(params));
  }

  public deleteTemplate(templateName: string) {
    return this.sesClient.send(
      new DeleteTemplateCommand({
        TemplateName: templateName,
      }),
    );
  }
}
