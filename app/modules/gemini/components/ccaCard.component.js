(function () {
  'use strict';

  angular
    .module('Gemini')
    .component('ccaCard', {
      templateUrl: 'modules/gemini/components/cca-card.html',
      controller: CcaCardCtrl
    });

  /* @ngInject */
  function CcaCardCtrl($state) {
    var ctrl = this;
    ctrl.goto = goto;
    function goto() {
      $state.go('gem.servicesPartner');
    }
  }
})();
