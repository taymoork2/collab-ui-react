(function () {
  'use strict';

  angular
    .module("Hercules")
    .controller("RedirectTargetController", RedirectTargetController);

  /* @ngInject */
  function RedirectTargetController(RedirectTargetService, $modalInstance, $window) {
    var vm = this;
    vm.addRedirectTargetClicked = addRedirectTargetClicked;

    function addRedirectTargetClicked(hostName) {
      RedirectTargetService.addRedirectTarget(hostName).then(function () {
        $modalInstance.close();
        $window.open("https://" + hostName);
      });
    }
  }
}());
