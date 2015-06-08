(function () {
  'use strict';
  angular
    .module('Squared')
    .controller('AddDeviceController',

      /*
        todo: 
          - use csdm
          - move vm.showAdd here
          - remove all sc.* in the view
          - remove unused code from devicesCtrl
      */

      /* @ngInject */
      function ($scope, Notification, CsdmService, XhrNotificationService) {

        $scope.showAdd = true;
        $scope.deviceName = '';
        $scope.activationCode = '';
        $scope.addDeviceInProgress = false;

        var formatActivationCode = function (activationCode) {
          var acode = '';
          if (activationCode) {
            var parts = activationCode.match(/[\s\S]{1,4}/g) || [];
            for (var x = 0; x < parts.length - 1; x++) {
              acode = acode + parts[x] + ' ';
            }
            acode = acode + parts[parts.length - 1];
          }
          return acode;
        };

        $scope.resetAddDevice = function () {
          $scope.showAdd = true;
          $scope.deviceName = '';
          $scope.notificationsFailed = false;

          window.setTimeout(function () {
            $('#newRoom').focus();
          }, 500);
        };

        $scope.showCopiedToClipboardMessage = function () {
          $('#copyCodeToClipboardButton i').tooltip('show');
          setTimeout(function () {
            $('#copyCodeToClipboardButton i').tooltip('destroy');
          }, 1000);
        };

        $scope.addDevice = function () {
          if (!$scope.deviceName) return;

          $scope.addDeviceInProgress = true;

          CsdmService.createCode($scope.deviceName, function (err, data) {
            if (err) {
              return XhrNotificationService.notify(err);
            }

            $scope.addDeviceInProgress = false;

            $scope.showAdd = false;

            if (data.activationCode && data.activationCode.length > 0) {
              $scope.activationCode = formatActivationCode(data.activationCode);
            }

            if (!data.emailConfCode && !data.conversationId) {
              $scope.notificationsFailed = true;
            }
          });
        };

      }

    )
    .directive('squaredAddDevice',
      function () {
        return {
          restrict: 'E',
          controller: 'AddDeviceController',
          templateUrl: 'modules/squared/devicesRedux/addDevice/addDevice.html'
        };
      }
    );
})();
