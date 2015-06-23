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
        };

        $scope.showCopiedToClipboardMessage = function () {
          $('#copyCodeToClipboardButton i').tooltip('show');
          setTimeout(function () {
            $('#copyCodeToClipboardButton i').tooltip('destroy');
          }, 3000);
        };

        $scope.addDevice = function (callback) {
          var deferred = $q.defer();

          if (!$scope.deviceName) return deferred.reject();

          CsdmService.createCode($scope.deviceName, function (err, data) {
            $scope.showAdd = false;

            if (err) {
              XhrNotificationService.notify(err);
              return deferred.reject();
            }

            deferred.resolve();

            if (data.activationCode && data.activationCode.length > 0) {
              $scope.activationCode = formatActivationCode(data.activationCode);
            }

            if (!data.emailConfCode && !data.conversationId) {
              $scope.notificationsFailed = true;
            }
          });

          return deferred.promise;
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
