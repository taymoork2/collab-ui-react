(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('UCConfigController', UCConfigController);

  /* @ngInject */
  function UCConfigController($scope, USSService, Notification, Authinfo) {

    $scope.saving = false;
    $scope.loading = true;

    USSService.getOrg(Authinfo.getOrgId(), function (err, org) {
      $scope.loading = false;
      if (err) return Notification.notify(err);
      $scope.org = org || {};
    });

    $scope.update = function () {
      $scope.error = null;
      $scope.saving = true;
      USSService.updateOrg($scope.org, function (err) {
        $scope.saving = false;
        if (err) {
          $scope.error = "SIP domain was invalid. Please enter a valid SIP domain or IP address.";
        } else {
          $scope.$parent.modal.close();
        }
      });
    };
  }
}());
