export class MailValidatorService {

  /* @ngInject */
  constructor() { }

  public isValidEmailCsv(emailString: string): boolean {
    const mailRegExp = new RegExp("[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?");

    return _.every(emailString.split(','), (email) => {
      return email.match(mailRegExp);
    });
  }

}

angular
  .module('Hercules')
  .service('MailValidatorService', MailValidatorService);
