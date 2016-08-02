(function () {
  'use strict';

  angular.module('Hercules')
    .controller('MediafusionEndController', MediafusionEndController);

  /* @ngInject */
  function MediafusionEndController($stateParams, $window) {
    var vm = this;
    var wizardData = $stateParams.wizard.state().data;
    var id = wizardData.mediafusion.id;
    vm.hostname = wizardData.mediafusion.hostname;
    vm.name = wizardData.mediafusion.name;
    vm.next = next;

    ///////////////

    function next() {
      $window.open('https://' + encodeURIComponent(vm.hostname) + '/?clusterName=' + encodeURIComponent(vm.name) + '&clusterId=' + encodeURIComponent(id));
    }
  }
})();
