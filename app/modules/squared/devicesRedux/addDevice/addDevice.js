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
      function ($scope, Notification) {

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

        $scope.addDevice = function () {
          if (!$scope.deviceName) return;

          $scope.addDeviceInProgress = true;

          SpacesService.addDevice($scope.deviceName, function (data, status) {
            $scope.addDeviceInProgress = false;

            if (data.success === true) {
              vm.showAdd = false;

              if (data.activationCode && data.activationCode.length > 0) {
                $scope.activationCode = formatActivationCode(data.activationCode);
              }

              var successMessage = $scope.deviceName + ' added successfully.';
              // Notification requires change to accomodate displaying 2nd line with different font size.
              // for now change the font inline in the message.
              if (data.emailConfCode === undefined && data.conversationId === undefined) {
                successMessage = successMessage + '<br><p style="font-size:xx-small">Notifications failed.</p>';
              }
              Notification.notify([successMessage], 'success');

              // setTimeout(function () {
              //   getAllDevices();
              // }, 1000);

            } else {
              Notification.notify(['Error adding ' + $scope.deviceName + '. Status: ' + status], 'error');
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
