angular
  .module('Hercules')
  .controller('NotificationConfigController', ['$scope', 'ServiceDescriptor', function ($scope, service) {

  }])
  .directive('herculesNotificationConfig', [
    function () {
      return {
        scope: false,
        restrict: 'E',
        controller: 'NotificationConfigController',
        templateUrl: 'modules/hercules/notification-config/notification-config.html'
      };
    }
  ]);
