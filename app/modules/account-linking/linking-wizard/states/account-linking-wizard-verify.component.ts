import { WizardEvent } from './../account-linking-wizard.component';

class AccountLinkingWizardVerifyComponentCtrl implements ng.IComponentController {

  private nextFunc: Function;
  public selection: string;

  /* @ngInject */
  constructor(private $log: ng.ILogService) {
  }

  public $onInit() {
    this.$log.info('init AccountLinkingWizardVerifyComponentCtrl');
  }

  public showNext() {
    return this.selection !== undefined;
  }

  public next() {
    switch (this.selection) {
      case 'signAgreement': {
        this.nextFunc({ event: WizardEvent.signAgreement });
        break;
      }
      case 'verifyNow': {
        this.nextFunc({ event: WizardEvent.verifyNow });
        break;
      }
    }
  }

}

export class AccountLinkingWizardVerifyComponent implements ng.IComponentOptions {

  public controller = AccountLinkingWizardVerifyComponentCtrl;
  public template = require('./account-linking-wizard-verify.html');
  public bindings = {
    nextFunc: '&',
    backFunc: '&',
  };
}
