'use strict';

angular
  .module('Mediafusion').controller('EmailNotificationConfigController', [
    '$scope', 'EmailNotificationConfigService', 'XhrNotificationService', 'EmailValidatorService',
    function ($scope, service, notification, validator) {

      $scope.saving = false;
      $scope.loading = true;

      service.read(function (err, config) {
        $scope.loading = false;
        if (err) return notification.notify(err);
        $scope.config = config || {};
      });

      $scope.writeConfig = function () {
        if ($scope.config.wx2users && !validator.isValidEmailCsv($scope.config.wx2users)) {
          $scope.error = "Please enter a list of comma-separated email addresses";
        } else {
          $scope.error = null;
          $scope.saving = true;
          service.write($scope.config, function (err) {
            $scope.saving = false;
            if (err) return notification.notify(err);
            $scope.$parent.modal.close();
          });
        }
      };

    }
  ]);
