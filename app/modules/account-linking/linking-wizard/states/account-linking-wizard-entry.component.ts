import { WizardEvent } from './../account-linking-wizard.component';
import { IACSiteInfo } from './../../account-linking.interface';

class AccountLinkingWizardEntryComponentCtrl implements ng.IComponentController {

  private nextFunc: Function;
  public siteinfo: IACSiteInfo;

  /* @ngInject */
  constructor(private $log: ng.ILogService) {
  }

  public $onInit() {
    this.$log.info('init AccountLinkingWizardEntryComponentCtrl');
  }

  public receiveEmail() {
    this.nextFunc({ event: WizardEvent.receiveEmail });
  }

  public verify() {
    this.nextFunc({ event: WizardEvent.verify });
  }
}

export class AccountLinkingWizardEntryComponent implements ng.IComponentOptions {

  public controller = AccountLinkingWizardEntryComponentCtrl;
  public template = require('./account-linking-wizard-entry.html');
  public bindings = {
    nextFunc: '&',
    backFunc: '&',
    siteinfo: '<',
  };
}
