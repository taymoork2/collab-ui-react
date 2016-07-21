(function () {
  'use strict';

  angular.module('Hercules')
    .controller('ExpresswayEndController', ExpresswayEndController);

  /* @ngInject */
  function ExpresswayEndController($stateParams, $window) {
    var vm = this;
    var wizardData = $stateParams.wizard.state().data;
    var hostname = wizardData.expressway.hostname;
    vm.next = next;

    ///////////////

    function next() {
      $window.open('https://' + encodeURIComponent(hostname) + '/fusionregistration');
    }
  }
})();
