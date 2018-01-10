import { WizardEvent } from './../account-linking-wizard.component';

class AccountLinkingWizardReceiveemailComponentCtrl implements ng.IComponentController {

  public launchWebexFn;
  public nextFunc;

  /* @ngInject */
  constructor(private $log: ng.ILogService) {
  }

  public $onInit() {
    this.$log.info('init AccountLinkingWizardReceiveemailComponentCtrl');
  }

  public next() {
    this.nextFunc({ event: WizardEvent.next });
  }
}

export class AccountLinkingWizardReceiveemailComponent implements ng.IComponentOptions {

  public controller = AccountLinkingWizardReceiveemailComponentCtrl;
  public template = require('modules/account-linking/linking-wizard/states/account-linking-wizard-receiveemail.html');
  public bindings = {
    nextFunc: '&',
    backFunc: '&',
  };
}
