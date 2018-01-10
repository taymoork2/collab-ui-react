import { WizardEvent } from './../account-linking-wizard.component';

class AccountLinkingWizardAgreementacceptedComponentCtrl implements ng.IComponentController {

  public launchWebexFn;
  public nextFunc;
  public selection;

  /* @ngInject */
  constructor(private $log: ng.ILogService) {
  }

  public $onInit() {
    this.$log.info('init AccountLinkingWizardAgreementacceptedComponentCtrl');
  }

  public next() {
    this.nextFunc({ event: WizardEvent.next });
  }

}

export class AccountLinkingWizardAgreementacceptedComponent implements ng.IComponentOptions {

  public controller = AccountLinkingWizardAgreementacceptedComponentCtrl;
  public template = require('modules/account-linking/linking-wizard/states/account-linking-wizard-agreementaccepted.html');
  public bindings = {
    nextFunc: '&',
    backFunc: '&',
  };
}
