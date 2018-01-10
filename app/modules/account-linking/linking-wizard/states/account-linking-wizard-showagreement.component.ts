import { WizardEvent } from './../account-linking-wizard.component';

class AccountLinkingWizardShowagreementComponentCtrl implements ng.IComponentController {

  private nextFunc: Function;

  public agreementAccepted: boolean;

  /* @ngInject */
  constructor(private $log: ng.ILogService) {
  }

  public $onInit() {
    this.$log.info('init AccountLinkingWizardShowagreementComponentCtrl');
  }

  public next() {
    this.nextFunc({ event: WizardEvent.next });
  }

}

export class AccountLinkingWizardShowagreementComponent implements ng.IComponentOptions {

  public controller = AccountLinkingWizardShowagreementComponentCtrl;
  public template = require('modules/account-linking/linking-wizard/states/account-linking-wizard-showagreement.html');
  public bindings = {
    nextFunc: '&',
    backFunc: '&',
  };
}
