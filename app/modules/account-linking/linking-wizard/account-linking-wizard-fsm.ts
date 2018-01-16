
export interface IFsmTransitionCallback {
  from: string;
  event: string;
  state: string;

  startTransition: Date;
  endTransition: Date;

  problems: string[];
}

interface ITransition<STATE, EVENT> {
  from: STATE;
  event: EVENT;
  action?: Function;
  actionPromise?: Function;
  to: STATE;
}

export enum SpecialEvent {
  BACK = 'back',
  ANY = '*',
}

export class WizardFsm<STATE, EVENT> {
  private transitions: ITransition<STATE, EVENT | SpecialEvent>[] = [];
  private currTrans: ITransition<STATE, EVENT | SpecialEvent>;

  private waitForActionFinish = false;

  constructor(
    private currState: STATE,
    private callbackFunc?: Function,
  ) {
  }

  public from(state: STATE, event: EVENT | SpecialEvent) {
    this.currTrans = {
      from: state,
      event : event,
      action: undefined,
      actionPromise: undefined,
      to: state,
    };
    this.transitions.push(this.currTrans);
    return this;
  }

  public action(action: Function) {
    this.currTrans.action = action;
    return this;
  }

  public actionPromise(action: Function) {
    this.currTrans.actionPromise = action;
    return this;
  }

  public to(state: STATE) {
    this.currTrans.to = state;
    return this;
  }

  public andBack() {
    const backTrans: ITransition<STATE, EVENT | SpecialEvent>  = {
      from: this.currTrans.to,
      event : SpecialEvent.BACK,
      action: undefined,
      actionPromise: undefined,
      to: this.currTrans.from,
    };
    this.transitions.push(backTrans);
    this.currTrans = backTrans;
    return this;
  }

  public getCurrState(): STATE {
    return this.currState;
  }

  public hasBack() {
    const back = _.find(this.transitions, (trans: ITransition<STATE, EVENT | SpecialEvent>) => {
      return trans.from === this.currState && trans.event === SpecialEvent.BACK;
    });
    return (back) ? true : false;
  }

  public transition = (event: EVENT | SpecialEvent) => {
    const transition = _.find(this.transitions, (trans: ITransition<STATE, EVENT | SpecialEvent>) => {
      return (trans.event === event || trans.event === SpecialEvent.ANY) && trans.from === this.currState;
    });
    const startTime = new Date();
    const problems: string[] = [];

    let actionResultPromise;
    let actionResult;

    if (transition && transition.to) {
      this.waitForActionFinish = true;
      if (transition.action) {
        //this.currStateActionResultPromise = this.$q.when(transition.action(this.currState, event, transition.to));
        actionResult = transition.action(this.currState, event, transition.to);
        this.waitForActionFinish = false;
      }

      if (transition.actionPromise) {
        actionResultPromise = transition.actionPromise(this.currState, event, transition.to).then((result) => {
          this.waitForActionFinish = false;
          this.callBack(this.currState, transition.to, event, startTime, problems);
          this.currState = transition.to;
          return result;
        });
      } else {
        this.callBack(this.currState, transition.to, event, startTime, problems);
        this.currState = transition.to;
      }

    } else {
      if (!transition) {
        problems.push('Event ' + event + ' is not known for state ' + this.currState);
      } else if (!transition.to) {
        problems.push('Event ' + event + ' has no to-state in state ' + this.currState);
      }
    }

    if (actionResultPromise) {
      return actionResultPromise.then((res) => {
        this.currState = transition.to;
        return res;
      });
    } else if (actionResult) {
      return actionResult;
    }

  }

  private callBack(fromState, toState, event, startTime, problems) {
    if (this.callbackFunc) {
      this.callbackFunc(<IFsmTransitionCallback>{
        from: fromState.toString(),
        event: event.toString(),
        state: toState.toString(),
        startTransition: startTime,
        endTransition: new Date(),
        problems: problems,
      });
    }
  }

  public getTransitionList() {
    return this.transitions;
  }

}
