import { ITimeoutService, IWindowService } from 'angular';

export class WizardFactory {

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $timeout: ng.ITimeoutService,
  ) { }

  public create(state) {
    return new Wizard(this.$state, state, this.$timeout);
  }
}

angular
  .module('Squared')
  .service('WizardFactory', WizardFactory);

class Wizard {

  constructor($state, private wizardState, private $timeout: ITimeoutService) {
    //TODO: remove this when refactored all to using newNext and newBack
    this.next = this.newNext.bind(this, $state);
    this.back = this.newBack.bind(this, $state);
  }

  /* @deprecated move to newNext, then rename*/
  public next: (data, nextOption) => {};

  public newNext($state, data, nextOption) {
    const next = this.wizardState.wizardState[this.wizardState.currentStateName].next || this.wizardState.wizardState[this.wizardState.currentStateName].nextOptions[nextOption];
    this.wizardState.history.push(this.wizardState.currentStateName);
    this.wizardState.currentStateName = next;
    _.mergeWith(this.wizardState.data, data, (original, update) => {
      // Need to override the merge behavior for arrays,
      // otherwise it's not possible to remove elements from an array for a next step
      if (_.isArray(original) && _.isArray(update)) {
        return update;
      }
    });
    $state.go(next, {
      wizard: this,
    });
  }

  /* @deprecated move to newBack, then rename*/
  public back: () => {};

  public newBack($state) {
    const nav = this.wizardState.history.pop();
    this.wizardState.currentStateName = nav;
    $state.go(nav, {
      wizard: this,
    });
  }

  public scrollToBottom(window: IWindowService) {
    this.$timeout(() => {
      const modalBody = window.document.getElementsByClassName('modal-body')[0];
      modalBody.scrollTop = modalBody.scrollHeight;
    }, 200);
  }

  public state() {
    return this.wizardState;
  }
}
