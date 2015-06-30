(function () {
  'use strict';
  angular
    .module('Squared')
    .controller('AddDeviceController',

      /* @ngInject */
      function ($scope, $q, Notification, CsdmService, XhrNotificationService, $timeout) {
        $scope.showAdd = true;
        $scope.deviceName = '';
        $scope.activationCode = '';

        $('#addRoomDialog').on('shown.bs.modal', function () {
          $('#newRoom').focus();
        });

        $scope.$watch('showAdd', function (shown) {
          if (shown) {
            $timeout(function () {
              $('#newRoom').focus();
            });
          }
        });

        var formatActivationCode = function (activationCode) {
          return activationCode ? activationCode.match(/.{4}/g).join(' ') : '';
        };

        $scope.resetAddDevice = function () {
          $scope.showAdd = true;
          $scope.deviceName = '';
          $scope.notificationsFailed = false;
        };

        $scope.showCopiedToClipboardMessage = function () {
          $('#copyCodeToClipboardButton i').tooltip('show');
          setTimeout(function () {
            $('#copyCodeToClipboardButton i').tooltip('destroy');
          }, 3000);
        };

        $scope.addDevice = function (callback) {
          if (!$scope.deviceName) {
            return $q.defer().reject();
          }

          function success(res) {
            var data = res.data;
            $scope.showAdd = false;

            if (data.activationCode && data.activationCode.length > 0) {
              $scope.activationCode = formatActivationCode(data.activationCode);
            }

            if (!data.emailConfCode && !data.conversationId) {
              $scope.notificationsFailed = true;
            }
          }

          return CsdmService
            .createCode($scope.deviceName)
            .then(success, XhrNotificationService.notify);
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
