(function () {
  'use strict';

  angular
    .module("Hercules")
    .controller("RedirectTargetController", RedirectTargetController);

  /* @ngInject */
  function RedirectTargetController(RedirectTargetService, $modalInstance, $window, XhrNotificationService) {
    var vm = this;
    vm.addRedirectTargetClicked = addRedirectTargetClicked;
    vm.redirectToTargetAndCloseWindowClicked = redirectToTargetAndCloseWindowClicked;
    vm.enableRedirectToTarget = false;
    vm.back = back;

    function addRedirectTargetClicked(hostName) {
      RedirectTargetService.addRedirectTarget(hostName).then(function () {
        vm.enableRedirectToTarget = true;
      }, XhrNotificationService.notify);
    }

    function redirectToTargetAndCloseWindowClicked(hostName) {
      $modalInstance.close();
      $window.open("https://" + encodeURIComponent(hostName) + "/fusionregistration");
    }

    function back() {
      vm.enableRedirectToTarget = false;
    }
  }
}());
