// TODO Check if mode can be changed i.e. if mode is manual or first time

import { LinkingOperation, IACSiteInfo } from './../account-linking.interface';
import { IWizardState, WizardState, WizardEvent, WizardFsm } from './account-linking-wizard-fsm';

enum AccountLinkingWizardState {
  Welcome = 'Welcome',
  Progress = 'Progress',
}

class AccountlinkingWizardComponentCtrl implements ng.IComponentController {

  public state: AccountLinkingWizardState = AccountLinkingWizardState.Welcome;
  public siteInfo: IACSiteInfo;
  public operation: LinkingOperation;

  public fsmState: IWizardState = { id: WizardState.entry, initial: true, final: false };
  public lastState: IWizardState;
  public event: string | undefined = undefined;
  public final: boolean = false;
  public initial: boolean = true;
  public noEmailAgreementAccepted: boolean = false;

  private fsm: WizardFsm;

  /* @ngInject */
  constructor(
    private $log,
    private $state,
    private $stateParams,

  ) {
    this.$log.debug('AccountlinkingWizardComponentCtrl constructor, stateParams:', this.$stateParams);
    this.siteInfo = this.$stateParams.siteInfo;

    // TODO: Use this to distinguish between fresh linking or modified linking in the UI
    if (this.operation === null) {
      this.operation = LinkingOperation.Modify;
    } else {
      this.operation = this.$stateParams.operation;
    }

    this.buildFsm();
  }

  public $onInit() {
    // TODO Fetch possible existing mode (from webex ?)
    this.$log.debug('onInit AccountLinkingWizardStateController');
  }

  public hasEvent(): boolean {
    return this.event !== undefined;
  }

  public next(event: string) {
    if (this.noEmailAgreementAccepted) {
      event = 'noEmailAgreementAccepted';
    }
    this.event = event;
    this.$log.debug('event 1', event);
    this.$log.debug('event 2', WizardEvent[event]);
    this.lastState = this.fsmState;
    this.fsmState = this.fsm.transition(WizardEvent[event]);
    this.final = this.fsm.isFinal();
    this.initial = this.fsm.isInitial();
    this.$log.debug('fsmState', this.fsmState);
  }

  public back() {
    this.fsmState = this.fsm.transition(WizardEvent.back);
    this.final = this.fsm.isFinal();
    this.initial = this.fsm.isInitial();
    this.noEmailAgreementAccepted = false;
  }

  public confirm() {
    // TODO do actions based on final state
    this.closeModal();
    this.$state.modal.result.then(() => {
      // TODO do actions based on final state
      this.$log.debug('DO STUFF BASED ON STATE', this.fsmState);
    });
  }

  public verifyDomain() {
    // TODO do actions bases on final state
    this.closeModal();
    this.$state.modal.result.then(() => {
      // TODO do actions based on final state
      this.$log.debug('DO STUFF BASED ON STATE', this.fsmState);
      this.$state.go('settings', {
        showSettings: 'domains',
      });
    });
  }

  public cancelModal() {
    this.$state.modal.dismiss();
  }

  private closeModal() {
    this.$state.modal.close();
  }

  private buildFsm() {
    const entry: IWizardState = { id: WizardState.entry, initial: true, final: false };
    this.fsm = new WizardFsm(entry, this.$log); // TODO Remove log argument
    const manualSelected: IWizardState = { id: WizardState.manualSelected, initial: false, final: true };
    this.fsm.from( entry, WizardEvent.manual).to(manualSelected, () => {} ).andBack();
    const noEmailAgreementSelected: IWizardState = { id: WizardState.noEmailAgreementSelected, initial: false, final: false };
    this.fsm.from(entry, WizardEvent.noEmailAgreement).to(noEmailAgreementSelected, () => {}).andBack();
    const noEmailAgreementAcceptedOk: IWizardState = { id: WizardState.noEmailAgreementAcceptedOk, initial: false, final: true };
    this.fsm.from(noEmailAgreementSelected, WizardEvent.noEmailAgreementAccepted).to(noEmailAgreementAcceptedOk, () => {}).andBack();
    const noEmailVerifiedDomainSelected: IWizardState = { id: WizardState.noEmailVerifiedDomainSelected, initial: false, final: true };
    this.fsm.from(entry, WizardEvent.noEmailVerifiedDomain).to(noEmailVerifiedDomainSelected, () => {}).andBack();
  }
}

export class AccountLinkingWizardComponent implements ng.IComponentOptions {

  /* @ngInject */
  constructor() {
  }

  public controller = AccountlinkingWizardComponentCtrl;
  public template = require('modules/account-linking/linking-wizard/account-linking-wizard.component.html');

  public bindings = {
  };
}
