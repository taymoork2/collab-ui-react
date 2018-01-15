import { LinkingOperation, IACSiteInfo, LinkingMode, IGotoWebex } from './../account-linking.interface';
import { WizardFsm, SpecialEvent, IFsmTransitionCallback } from './account-linking-wizard-fsm';

enum AccountLinkingWizardState {
  Welcome = 'Welcome',
  Progress = 'Progress',
}

export interface IOperatioButton {
  text: string;
  function: Function;
}

export enum WizardEvent {
  next = 'next',
  manual = 'manual',
  receiveEmail = 'receiveEmail',
  verify = 'verify',
  signAgreement = 'signAgreement',
  verifyNow = 'verifyNow',
  domainsFetched = 'domainsFetched',
}

export enum WizardState {
  uninitialized = 'uninitialized',
  entry = 'entry',
  receiveEmail = 'receiveEmail',
  verify = 'verify',
  fetchingDomains = 'fetchingDomains',
  verifyDomain = 'verifyDomain',
  domainsList = 'domainsList',
  showAgreement = 'showAgreement',
  agreementAccepted = 'agreementAccepted',
}

class AccountLinkingWizardComponentCtrl implements ng.IComponentController {

  public state: AccountLinkingWizardState = AccountLinkingWizardState.Welcome;

  public siteInfo: IACSiteInfo;
  public operation: LinkingOperation;
  public launchWebexFn: Function;
  public setAccountLinkingModeFn: Function;
  public dismiss: Function;

  public fsmState: WizardState = WizardState.entry;
  public event: string | undefined  = undefined;
  public final: boolean = false;
  public initial: boolean = true;

  public webexPage: IGotoWebex;

  public fsm: WizardFsm<WizardState, WizardEvent>;
  public buttons: IOperatioButton[] = [];

  public domainsList;

  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
    private $state: ng.ui.IStateService,
  ) {
    // TODO: Use this to distinguish between fresh linking or modified linking in the UI
    if (this.operation === null) {
      this.operation = LinkingOperation.Modify;
    }
    this.buildFsm();
    if (this.siteInfo && this.siteInfo.linkingMode === LinkingMode.MANUAL) {
      this.event = WizardEvent.manual;
    }
  }

  public $onInit() {
    // TODO Fetch possible existing mode (from webex ?)
    this.$log.debug('onInit AccountLinkingWizardStateController');
    this.$log.debug('siteInfo:', this.siteInfo);
    this.$log.debug('operation:', this.operation);
  }

  public hasEvent(): boolean {
    return this.event !== undefined;
  }

  public next(event: WizardEvent) {

    this.event = event;
    this.fsm.transition(event);

    this.fsmState = this.fsm.getCurrState();
    this.$log.debug('fsmState', this.fsmState);
  }

  public back() {
    this.fsm.transition(SpecialEvent.BACK);
    this.fsmState = this.fsm.getCurrState();
  }

  public cancelModal() {
    this.dismiss();
  }

  private closeModal() {
    this.dismiss();
  }

  public launchWebex() {
    this.$log.info('Launch WebEx from wizard...');

    this.launchWebexFn({ site: this.siteInfo, useHomepage: false });
    this.closeModal();
  }

  private gotoDomainsSettings(): void {
    this.$log.info('Goto domains settings page from wizard...');
    this.$state.go('settings', {
      showSettings: 'domains',
    });
  }

  private setAccountLinkingMode(mode: LinkingMode) {
    this.setAccountLinkingModeFn({ siteUrl: this.siteInfo.linkedSiteUrl, mode: mode });
  }

  private buildFsm() {
    this.fsm = new WizardFsm<WizardState, WizardEvent>(WizardState.entry, this.transitionCallbackFunc);
    this.fsm
      .from(WizardState.uninitialized, SpecialEvent.ANY)
      .action(function() {})
      .to(WizardState.entry);
    this.fsm
      .from(WizardState.entry, WizardEvent.verify)
      .action(function() {})
      .to(WizardState.verify)
      .andBack()
      .action(function() {});
    this.fsm
      .from(WizardState.entry, WizardEvent.receiveEmail)
      .to(WizardState.receiveEmail)
      .andBack();
    this.fsm
      .from(WizardState.verify, WizardEvent.signAgreement)
      .to(WizardState.fetchingDomains)
      .andBack();
    this.fsm
      .from(WizardState.verify, WizardEvent.verifyNow)
      .to(WizardState.verifyDomain)
      .andBack();
    this.fsm
      .from(WizardState.fetchingDomains, WizardEvent.domainsFetched)
      .to(WizardState.domainsList);
    this.fsm
      .from(WizardState.domainsList, WizardEvent.next)
      .to(WizardState.showAgreement)
      .andBack();
    this.fsm
      .from(WizardState.domainsList, SpecialEvent.BACK)
      .to(WizardState.verify);
    this.fsm
      .from(WizardState.showAgreement, WizardEvent.next)
      .to(WizardState.agreementAccepted)
      .andBack();
    this.fsm
      .from(WizardState.agreementAccepted, WizardEvent.next)
      .action(() => {
        this.setAccountLinkingMode(LinkingMode.AUTO_AGREEMENT);
        this.launchWebex();
      });
    this.fsm
      .from(WizardState.receiveEmail, WizardEvent.next)
      .action(() => {
        this.setAccountLinkingMode(LinkingMode.MANUAL);
        this.launchWebex();
      });
    this.fsm
      .from(WizardState.verifyDomain, WizardEvent.next)
      .action(() => {
        this.setAccountLinkingMode(LinkingMode.AUTO_VERIFY_DOMAIN);
        this.gotoDomainsSettings();
      });
    this.fsm.transition(SpecialEvent.ANY);
    this.showTransitionList();
  }

  public showTransitionList() {
    this.$log.debug('Registered transition list');
    this.fsm.getTransitionList().forEach( (transition) => {
      this.$log.debug('Entry:', transition);
    });
  }

  public getCurrentState(): WizardState {
    return this.fsm.getCurrState();
  }

  private transitionCallbackFunc = (info: IFsmTransitionCallback) => {
    //TODO: Remove this debug info before release !
    this.showTransitions(info);
  }

  private showTransitions = (info: IFsmTransitionCallback) => {
    this.$log.debug('-----------------------------------------------------------------------');
    this.$log.debug('Start@ ' + info.startTransition);
    this.$log.debug('   state[' + info.from + ']----event:' + info.event + '--->state[', info.state + ']');
    this.$log.debug('End@' + info.endTransition);
    if (!_.isEmpty(info.problems)) {
      this.$log.debug('Problems:');
      info.problems.forEach((problem, i) => {
        this.$log.debug(' ' + (i + 1) + ': ' + problem);
      });
    }
    this.$log.debug('-----------------------------------------------------------------------');
  }
}

export class AccountLinkingWizardComponent implements ng.IComponentOptions {

  /* @ngInject */
  constructor() {
  }

  public controller = AccountLinkingWizardComponentCtrl;
  public template = require('modules/account-linking/linking-wizard/account-linking-wizard.component.html');

  public bindings = {
    siteInfo: '<',
    operation: '<',
    launchWebexFn: '&',
    setAccountLinkingModeFn: '&',
    dismiss: '&',
  };
}
