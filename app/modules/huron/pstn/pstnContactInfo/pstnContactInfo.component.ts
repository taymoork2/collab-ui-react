interface IPstnContractInfo {
  companyName: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  confirmEmailAddress: string;
}

export class PstnContactInfoComponent implements ng.IComponentOptions {
  public controller = PstnProvidersCtrl;
  public templateUrl = 'modules/huron/pstn/pstnContactInfo/pstnContactInfo.html';
  public bindings = {
    // contact should be an object with properties companyName, firstName, lastName, emailAddress and confirmEmailAddress
    contact: '<',
  };
}

export class PstnProvidersCtrl implements ng.IComponentController {
  public contact: IPstnContractInfo;
  public emailValidators: Object;
  public errorMessages: Object;
  public form: ng.IFormController;

  public $onInit(): void {
    this.emailValidators = {
      emailsDonotMatch: (viewValue: string) => this.verifyConfirmEmailAddress(viewValue),
    };
  }

  public verifyConfirmEmailAddress(viewValue: string): boolean {
    return _.isEqual(viewValue.toLowerCase(), this.contact.emailAddress.toLowerCase());
  }
}
