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

    function getTranslatedErrorMessage(data) {
      // the 500 error is the default message
      var message = $translate.instant('hercules.redirect-target-dialog.register-error-500');

      if (data && data.status === 400) {
        message = $translate.instant('hercules.redirect-target-dialog.register-error-400');
      }
      return message;
    }

    function addRedirectTargetClicked(hostName) {
      RedirectTargetService.addRedirectTarget(hostName).then(function () {
        vm.enableRedirectToTarget = true;
      }, function (data) {
        var message = getTranslatedErrorMessage(data);

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
