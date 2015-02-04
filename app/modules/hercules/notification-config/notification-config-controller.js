angular
  .module('Hercules').controller('NotificationConfigController', [
    '$scope', 'NotificationConfigService', 'Notification',
    function ($scope, service, notification) {

      $scope.saving = false;
      $scope.loading = true;

      var notify = function (data, status, headers, config) {
        var messages = [data || 'Request failed with status ' + status];
        notification.notify(messages, 'error');
      };

      service.read(function (err, config) {
        $scope.loading = false;
        if (err) return notify.apply(null, err);
        $scope.config = config;
      });

      $scope.writeConfig = function () {
        $scope.saving = true;
        service.write($scope.config, function (err) {
          $scope.saving = false;
          if (err) return notify.apply(null, err);
          $scope.$parent.modal.close()
        });
      };

    }
  ]);
