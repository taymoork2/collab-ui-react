(function () {
  'use strict';

  angular
    .module("Hercules")
    .controller("RedirectTargetController", RedirectTargetController);

  /* @ngInject */
  function RedirectTargetController(RedirectTargetService, $modalInstance, $window, XhrNotificationService, $translate) {
    var vm = this;
    vm.addRedirectTargetClicked = addRedirectTargetClicked;
    vm.redirectToTargetAndCloseWindowClicked = redirectToTargetAndCloseWindowClicked;
    vm.enableRedirectToTarget = false;
    vm.back = back;

    function addRedirectTargetClicked(hostName) {
      RedirectTargetService.addRedirectTarget(hostName).then(function () {
        vm.enableRedirectToTarget = true;
      }, function (data) {
        console.log('in reject');
        var message = $translate.instant('hercules.redirect-target-dialog.register-error-500');

        if (data.status === 400) {
          message = $translate.instant('hercules.redirect-target-dialog.register-error-400');
        }

        XhrNotificationService.notify(message);
      });
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
