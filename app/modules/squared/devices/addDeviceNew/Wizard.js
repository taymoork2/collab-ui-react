(function () {
  'use strict';

  angular.module('Core').service('WizardFactory', WizardFactory);

  function WizardFactory($injector) {
    function create(state) {
      return $injector.instantiate(Wizard, {
        wizardState: state
      });
    }
    return {
      create: create
    };
  }

  /* @ngInject  */
  function Wizard($state, wizardState) {

    function next(data, nextOption) {
      var next = wizardState.wizardState[wizardState.currentStateName].next || wizardState.wizardState[wizardState.currentStateName].nextOptions[nextOption];
      wizardState.history.push(wizardState.currentStateName);
      wizardState.currentStateName = next;
      _.extend(wizardState.data, data);
      $state.go(next, {
        wizard: this
      });
    }

    function back() {
      var nav = wizardState.history.pop();
      wizardState.currentStateName = nav;
      $state.go(nav, {
        wizard: this
      });
    }

    function state() {
      return wizardState;
    }

    return {
      next: next,
      back: back,
      state: state
    };

  }

})();
