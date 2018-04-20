import { TerminusService } from 'modules/huron/pstn';
import { Notification } from 'modules/core/notifications';

interface IPstnContractInfo {
  companyName: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  confirmEmailAddress: string;
}

export class PstnContactInfoComponent implements ng.IComponentOptions {
  public controller = PstnProvidersCtrl;
  public template = require('modules/huron/pstn/pstnContactInfo/pstnContactInfo.html');
  public bindings = {
    // contact should be an object with properties companyName, firstName, lastName, emailAddress and confirmEmailAddress
    contact: '<',
  };
}

export class PstnProvidersCtrl implements ng.IComponentController {
  public contact: IPstnContractInfo;
  public form: ng.IFormController;

  /* @ngInject */
  constructor(
    private TerminusService: TerminusService,
    private Notification: Notification,
  ) { }

  public checkTerminusCustomer() {
    return this.TerminusService.customerV2().query({
      name: this.contact.companyName,
    })
    .$promise;
  }

  public verifyLegalCompanyName() {
    this.checkTerminusCustomer()
    .then((response) => {
      this.form.companyName.$setValidity('duplicateCompanyName', (response.length === 0));
    })
    .catch(response => {
      this.Notification.errorResponse(response);
    });
  }

  public verifyConfirmEmailAddress() {
    if (!_.isEmpty(this.contact.emailAddress && !_.isEmpty(this.contact.confirmEmailAddress))) {
      const isMatched = _.isEqual(this.contact.confirmEmailAddress.toLowerCase(), this.contact.emailAddress.toLowerCase());
      this.form.confirmEmailAddress.$setValidity('emailsDonotMatch', isMatched);
    }
  }
}
