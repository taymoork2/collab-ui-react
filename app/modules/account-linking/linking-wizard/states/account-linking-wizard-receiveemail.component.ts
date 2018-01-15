import { WizardEvent } from './../account-linking-wizard.component';

class AccountLinkingWizardReceiveemailComponentCtrl implements ng.IComponentController {

  public launchWebexFn: Function;
  public nextFunc: Function;

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
  public template = require('./account-linking-wizard-receiveemail.html');
  public bindings = {
    nextFunc: '&',
    backFunc: '&',
  };
}
