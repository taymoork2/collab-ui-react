// TODO Use builder pattern for FSM

export enum WizardEvent {
  manual = 'manual',
  noEmailVerifiedDomain = 'noEmailVerifiedDomain',
  noEmailAgreement = 'noEmailAgreement',
  noEmailAgreementAccepted = 'noEmailAgreementAccepted',
  back = 'back',
}

export enum WizardState {
  entry = 'entry',
  manualSelected = 'manual_selected',
  noEmailAgreementSelected = 'no_email_agreement_selected',
  noEmailAgreementAcceptedOk = 'no_email_agreement_accepted_ok',
  noEmailVerifiedDomainSelected = 'no_email_verified_domain_selected',
}

export interface IWizardState {
  id: WizardState;
  initial: boolean;
  final: boolean;
}

export interface IWizardAction {
  (input?: any): void;
}

interface ITransition {
  from: IWizardState;
  event: WizardEvent;
  to: IWizardState;
  action?: IWizardAction;
}

interface IWizardFsm {
  from(state: IWizardState, event: WizardEvent): IWizardFsm;
  to(state: IWizardState, action?: IWizardAction): IWizardFsm;
  transition(event: WizardEvent): IWizardState;
  andBack(): void;
  isFinal(): boolean;
  isInitial(): boolean;
}

export class WizardFsm implements IWizardFsm {
  private transitions: ITransition[] = [];
  private currTrans: ITransition;

  // TOOD Remove logger argument
  constructor(private currState: IWizardState, private logger: any) {
  }

  public from(state: IWizardState, event: WizardEvent): IWizardFsm {
    this.currTrans = {
      from: state,
      event: event,
      to: state,
    };
    return this;
  }

  public to(state: IWizardState, action: IWizardAction): IWizardFsm {
    this.currTrans.to = state;
    this.currTrans.action = action;
    this.transitions.push(this.currTrans);
    return this;
  }

  public andBack() {
    const trans: ITransition = {
      from: this.currTrans.to,
      to: this.currTrans.from,
      event: WizardEvent.back,
    };
    this.transitions.push(trans);
  }

  public getCurrState(): IWizardState {
    return this.currState;
  }

  public transition(event: WizardEvent): IWizardState {
    this.logger.debug('transitions', this.transitions);
    const transition: ITransition = _.find<ITransition>(this.transitions, (trans: ITransition) => {
      this.logger.debug(trans.event + ' = ' + event + ', ' + trans.from.id + ' = ' + this.currState.id);
      return trans.event === event && trans.from.id === this.currState.id;
    });
    this.logger.debug('transition', transition);
    if (transition) {
      if (transition.action) {
        transition.action();
      }
      if (transition.to) {
        this.currState = transition.to;
      }
    }
    return this.currState;
  }

  public isInitial() {
    return this.currState.initial;
  }

  public isFinal(): boolean {
    return this.currState.final;
  }
}
