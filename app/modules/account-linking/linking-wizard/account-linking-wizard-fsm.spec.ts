import { WizardFsm, SpecialEvent } from './account-linking-wizard-fsm';

enum State {
  firstPage = 'firstPage',
  secondPage = 'secondPage',
  thirdPage = 'thirdPage',
  fourthPage = 'fourthPage',
}

enum Event {
  firstPage = 'firstPage',
  nextPage = 'nextPage',
  lastPage = 'lastPage',
}

describe('WizardFsm', () => {

  let fsm;

  beforeEach(function () {
    this.injectDependencies('$q', '$scope');
    fsm = new WizardFsm<State, Event>(State.firstPage, this.showTransitions);
  });

  it('Starts in first page', function () {
    fsm
      .from(State.firstPage, Event.nextPage)
      .to(State.secondPage);
    expect(fsm.getTransitionList().length).toEqual(1);
    expect(fsm.getCurrState()).toEqual(State.firstPage);
  });

  it('Go to next page', function () {
    fsm
      .from(State.firstPage, Event.nextPage)
      .to(State.secondPage);

    fsm.transition(Event.nextPage);
    expect(fsm.hasBack()).toBeFalsy();

    expect(fsm.getCurrState()).toEqual(State.secondPage);
  });

  it('Support back functionality when specified', function () {
    fsm
      .from(State.firstPage, Event.nextPage)
      .to(State.secondPage)
      .andBack();
    expect(fsm.getTransitionList().length).toEqual(2);

    fsm.transition(Event.nextPage);
    expect(fsm.hasBack()).toBeTruthy();

    fsm.transition(SpecialEvent.BACK);
    expect(fsm.getCurrState()).toEqual(State.firstPage);
  });

  it('Calls action and returnes state related data before next transition', function () {
    fsm
      .from(State.firstPage, Event.nextPage)
      .to(State.secondPage)
      .action((fromState, event, toState) => {
        return 'someStateActionRelatedDataReturned_' + fromState + '_' + event + '_' + toState;
      });
    expect(fsm.getCurrState()).toEqual(State.firstPage);
    const result = fsm.transition(Event.nextPage);
    expect(fsm.getCurrState()).toEqual(State.secondPage);
    expect(result).toEqual('someStateActionRelatedDataReturned_firstPage_nextPage_secondPage');

  });

  it('Calls promise based action and returnes state related data before next transition', function () {
    fsm
      .from(State.firstPage, Event.nextPage)
      .to(State.secondPage)
      .actionPromise( (fromState, event, toState) => {
        return this.$q.when('someStateActionRelatedDataReturned_' + fromState + '_' + event + '_' + toState);
      });
    expect(fsm.getCurrState()).toEqual(State.firstPage);

    fsm.transition(Event.nextPage).then( function(result) {
      expect(result).toEqual('someStateActionRelatedDataReturned_firstPage_nextPage_secondPage');
      expect(fsm.getCurrState()).toEqual(State.secondPage);
    });
    this.$scope.$apply();

  });

  it('Calls action before back transition', function () {
    let actionResult;
    fsm
      .from(State.firstPage, Event.nextPage)
      .to(State.secondPage)
      .andBack()
      .action(() => {
        actionResult = 'done';
      });
    fsm.transition(Event.nextPage);
    fsm.transition(SpecialEvent.BACK);
    expect(fsm.getCurrState()).toEqual(State.firstPage);
    expect(actionResult).toEqual('done');
  });

  it('Supports transition to a state to another specific state independent on event type', function () {
    fsm
      .from(State.firstPage, SpecialEvent.ANY)
      .to(State.fourthPage)
      .from(State.fourthPage, SpecialEvent.ANY)
      .to(State.firstPage);
    fsm.transition(Event.nextPage);
    expect(fsm.getCurrState()).toEqual(State.fourthPage);
    fsm.transition(Event.nextPage);
    expect(fsm.getCurrState()).toEqual(State.firstPage);
    fsm.transition(Event.firstPage);
    expect(fsm.getCurrState()).toEqual(State.fourthPage);
  });

  it('Handles more complex scenario', function () {
    let actionResult;
    fsm
      .from(State.firstPage, Event.nextPage)
      .to(State.secondPage)
      .andBack();
    expect(fsm.getTransitionList().length).toEqual(2);
    fsm
      .from(State.firstPage, Event.lastPage)
      .to(State.fourthPage);
    expect(fsm.getTransitionList().length).toEqual(3);
    fsm
      .from(State.secondPage, Event.nextPage)
      .to(State.thirdPage)
      .action(() => {
        actionResult = 'has visited third page';
      })
      .andBack();
    expect(fsm.getTransitionList().length).toEqual(5);
    fsm
      .from(State.thirdPage, Event.nextPage)
      .to(State.fourthPage)
      .andBack();
    expect(fsm.getTransitionList().length).toEqual(7);

    fsm.transition(Event.nextPage);
    fsm.transition(SpecialEvent.BACK);
    expect(fsm.getCurrState()).toEqual(State.firstPage);

    fsm.transition(Event.nextPage);
    expect(fsm.getCurrState()).toEqual(State.secondPage);

    fsm.transition(Event.nextPage);
    expect(fsm.getCurrState()).toEqual(State.thirdPage);

    fsm.transition(Event.nextPage);
    expect(fsm.getCurrState()).toEqual(State.fourthPage);

    fsm.transition(SpecialEvent.BACK);
    fsm.transition(SpecialEvent.BACK);
    fsm.transition(SpecialEvent.BACK);
    expect(fsm.getCurrState()).toEqual(State.firstPage);

    fsm.transition(Event.lastPage);
    expect(fsm.getCurrState()).toEqual(State.fourthPage);

    expect(actionResult).toEqual('has visited third page');
  });
});

