import { WizardState, WizardEvent } from './../account-linking-wizard.component';
import { IACSiteInfo } from './../../account-linking.interface';

class AccountLinkingWizardFetchingdomainsComponentCtrl implements ng.IComponentController {

  private nextFunc: Function;
  private backFunc: Function;
  public siteinfo: IACSiteInfo;

  private pollTimer: ng.IIntervalService;
  private noOfPolls: number;

  /* @ngInject */
  constructor(private $log: ng.ILogService,
              private $interval) {
  }

  public $onInit() {
    this.$log.info('init AccountLinkingWizardFetchingdomainsComponentCtrl');
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    if (changes.state && changes.state.currentValue) {
      if (changes.state.currentValue === WizardState.fetchingDomains) {
        this.fetchDomains();
      }
    } else {
      this.$log.warn('NO current value for state', changes.state);
    }
  }

  public $onDestroy() {
    this.$interval.cancel(this.pollTimer);
  }

  public cancel() {
    this.$interval.cancel(this.pollTimer);
    this.backFunc();
  }

  private forceNextState() {
    this.$interval.cancel(this.pollTimer);
    this.nextFunc({ event: WizardEvent.domainsFetched });
  }
  public fetchDomains() {
    this.$log.info('fetch domains !!!!');
    this.noOfPolls = 1;
    this.pollTimer = this.$interval( () => {
      this.$log.info('poll for domains in siteinfo... ', this.siteinfo);
      if (!_.isEmpty(this.siteinfo.domains)) {
        this.$log.info('Check for domains', this.siteinfo.domains);
        this.forceNextState();
      }

      this.noOfPolls ++;
      if (this.noOfPolls > 20) {
        this.$log.warn('Didnt find any domains... jumping out of state...');
        this.forceNextState();
      }

    }, 5000);
  }

}

export class AccountLinkingWizardFetchingdomainsComponent implements ng.IComponentOptions {

  public controller = AccountLinkingWizardFetchingdomainsComponentCtrl;
  public template = require('./account-linking-wizard-fetchingdomains.html');
  public bindings = {
    state: '<',
    nextFunc: '&',
    backFunc: '&',
    siteinfo: '<',
  };
}
