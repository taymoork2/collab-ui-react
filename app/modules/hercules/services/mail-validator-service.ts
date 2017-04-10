export class MailValidatorService {

  /* @ngInject */
  constructor() { }

  public isValidEmailCsv(emailString: string): boolean {
    let mailRegExp = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");

    return _.every(emailString.split(','), (email) => {
      return email.match(mailRegExp);
    });
  }

}

angular
  .module('Hercules')
  .service('MailValidatorService', MailValidatorService);
