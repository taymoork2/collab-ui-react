(function () {
  'use strict';

  angular.module('Hercules')
    .controller('ExpresswayEndController', ExpresswayEndController);

  /* @ngInject */
  function ExpresswayEndController($stateParams, $window, FeatureToggleService) {
    var vm = this;
    var wizardData = $stateParams.wizard.state().data;
    var hostname = wizardData.expressway.hostname;
    vm.next = next;
    vm.nameChangeEnabled = false;

    FeatureToggleService.atlas2017NameChangeGetStatus().then(function (toggle) {
      vm.nameChangeEnabled = toggle;
    });
    ///////////////

    function next() {
      $window.open('https://' + encodeURIComponent(hostname) + '/fusionregistration');
    }
  }
})();
