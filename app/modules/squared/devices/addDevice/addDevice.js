(function () {
  'use strict';
  angular
    .module('Squared')
    .controller('AddDeviceController',

      /* @ngInject */
      function ($scope, $q, $state, $modalInstance, Notification, CsdmCodeService, XhrNotificationService, $timeout) {
        var adc = this;

        adc.showAdd = true;
        adc.deviceName = '';
        adc.activationCode = '';
        adc.expiryTime = '';

        $scope.$watch('adc.showAdd', function (shown) {
          if (shown) {
            $timeout(function () {
              $('#newRoom').focus();
            });
          }
        });

        var formatActivationCode = function (activationCode) {
          return activationCode ? activationCode.match(/.{4}/g).join(' ') : '';
        };

        adc.resetAddDevice = function () {
          adc.showAdd = true;
          adc.deviceName = '';
          adc.notificationsFailed = false;
        };

        adc.addDevice = function (callback) {
          if (!adc.isNameValid()) {
            return $q.defer().reject();
          }

          function success(code) {
            adc.showAdd = false;

            if (code.activationCode && code.activationCode.length > 0) {
              adc.activationCode = formatActivationCode(code.activationCode);
              adc.expiryTime = code.expiryTime;
            }

            if (!code.emailConfCode && !code.conversationId) {
              adc.notificationsFailed = true;
            }
          }

          return CsdmCodeService
            .createCode(adc.deviceName)
            .then(success, XhrNotificationService.notify);
        };

        adc.isNameValid = function () {
          return adc.deviceName && adc.deviceName.length < 128;
        };

        adc.clickUsers = function () {
          $state.go('users.list');
          $modalInstance.dismiss();
        };
      }
    )
    .service('AddDeviceModal',
      /* @ngInject */
      function ($modal) {
        function open() {
          return $modal.open({
            controllerAs: 'adc',
            controller: 'AddDeviceController',
            templateUrl: 'modules/squared/devices/addDevice/addDevice.html'
          }).result;
        }

        return {
          open: open
        };
      }
    );
})();
