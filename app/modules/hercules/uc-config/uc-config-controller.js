'use strict';

angular
  .module('Hercules').controller('UCConfigController', [
    '$scope', 'USSService', 'XhrNotificationService', 'Authinfo',
    function ($scope, ussService, notification, Authinfo) {

      $scope.saving = false;
      $scope.loading = true;

      ussService.getOrg(Authinfo.getOrgId(), function (err, org) {
        $scope.loading = false;
        if (err) return notification.notify(err);
        $scope.org = org || {};
      });

      $scope.update = function () {
        if (!$scope.org.sipDomain || $scope.org.sipDomain.length === 0) {
          $scope.error = "Please enter a SIP domain or IP address";
        } else {
          $scope.error = null;
          $scope.saving = true;
          ussService.updateOrg($scope.org, function (err) {
            $scope.saving = false;
            if (err) return notification.notify(err);
            $scope.$parent.modal.close();
          });
        }
      };
    }
  ]);
