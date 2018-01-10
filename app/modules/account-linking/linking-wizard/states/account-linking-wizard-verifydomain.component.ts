import { WizardEvent } from './../account-linking-wizard.component';

class AccountLinkingWizardVerifydomainComponentCtrl implements ng.IComponentController {

  public nextFunc;

  /* @ngInject */
  constructor(private $log: ng.ILogService) {
  }

  public $onInit() {
    this.$log.info('init AccountLinkingWizardVerifydomainComponentCtrl');
  }

  public next() {
    this.nextFunc({ event: WizardEvent.next });
  }
}

export class AccountLinkingWizardVerifydomainComponent implements ng.IComponentOptions {

  public controller = AccountLinkingWizardVerifydomainComponentCtrl;
  public template = require('modules/account-linking/linking-wizard/states/account-linking-wizard-verifydomain.html');
  public bindings = {
    nextFunc: '&',
    backFunc: '&',
  };
}
