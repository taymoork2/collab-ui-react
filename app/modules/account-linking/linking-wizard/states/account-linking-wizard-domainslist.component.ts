import { WizardEvent } from './../account-linking-wizard.component';

class AccountLinkingWizardDomainslistComponentCtrl implements ng.IComponentController {

  private nextFunc: Function;
  private publicDomainsFunc: Function;
  private domainsFunc: Function;

  /* @ngInject */
  constructor(private $log: ng.ILogService) {
  }

  public $onInit() {
    this.$log.info('init AccountLinkingWizardDomainslistComponentCtrl');
  }

  public next() {
    this.nextFunc({ event: WizardEvent.next });
  }

  public getPublicDomains(from, to) {
    return this.publicDomainsFunc({
      from: from,
      to: to,
    });
  }

  public getDomains(from, to) {
    return this.domainsFunc({
      from: from,
      to: to,
    });
  }
}

export class AccountLinkingWizardDomainslistComponent implements ng.IComponentOptions {

  public controller = AccountLinkingWizardDomainslistComponentCtrl;
  public template = require('./account-linking-wizard-domainslist.html');
  public bindings = {
    nextFunc: '&',
    backFunc: '&',
    domainsFunc: '&',
    publicDomainsFunc: '&',
  };
}
