angular
  .module('Hercules').controller('NotificationConfigController', [
    '$scope', 'NotificationConfigService', 'XhrNotificationService',
    function ($scope, service, notification) {

      $scope.saving = false;
      $scope.loading = true;

      service.read(function (err, config) {
        $scope.loading = false;
        if (err) return notification.notify(err);
        $scope.config = config;
      });

      $scope.writeConfig = function () {
        $scope.saving = true;
        service.write($scope.config, function (err) {
          $scope.saving = false;
          if (err) return notification.notify(err);
          $scope.$parent.modal.close()
        });
      };

    }
  ]);
