angular
  .module('Hercules').controller('NotificationConfigController', [
    '$scope', 'NotificationConfigService', 'Notification',
    function ($scope, service, notification) {

      var notify = function (data, status, headers, config) {
        var messages = [data || 'Request failed with status ' + status];
        notification.notify(messages, 'error');
      };

      service.read(function (err, config) {
        if (err) return notify.apply(null, err);
        $scope.config = config;
      });

      $scope.writeConfig = function () {
        service.write($scope.config, function (err) {
          if (err) return notify.apply(null, err);
          $scope.$parent.modal.close()
        });
      };

    }
  ]);
