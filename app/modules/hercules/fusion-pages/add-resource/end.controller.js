(function () {
  'use strict';

  angular.module('Hercules')
    .controller('EndController', EndController);

  /* @ngInject */
  function EndController($stateParams, $window) {
    var vm = this;
    var wizardData = $stateParams.wizard.state().data;
    var hostname = wizardData.expressway.hostname;
    vm.next = next;

    ///////////////

    function next() {
      // $modalInstance.close();
      $window.open('https://' + encodeURIComponent(hostname) + '/fusionregistration');
    }
  }
})();
