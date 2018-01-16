import { WizardEvent } from './../account-linking-wizard.component';
import { IACSiteInfo } from './../../account-linking.interface';

class AccountLinkingWizardDomainslistComponentCtrl implements ng.IComponentController {

  private nextFunc: Function;
  public siteinfo: IACSiteInfo;

  /* @ngInject */
  constructor(private $log: ng.ILogService) {
  }

  public $onInit() {
    this.$log.info('init AccountLinkingWizardDomainslistComponentCtrl');
  }

  public getDomains(from, to) {
    if (this.siteinfo.domains) {
      return this.siteinfo.domains.slice(from, to);
    }
  }

  public next() {
    this.nextFunc({ event: WizardEvent.next });
  }

}

export class AccountLinkingWizardDomainslistComponent implements ng.IComponentOptions {

  public controller = AccountLinkingWizardDomainslistComponentCtrl;
  public template = require('./account-linking-wizard-domainslist.html');
  public bindings = {
    nextFunc: '&',
    backFunc: '&',
    siteinfo: '<',
  };
}
