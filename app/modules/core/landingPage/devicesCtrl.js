'use strict';

angular.module('Core')

.controller('DevicesCtrl', ['$scope', 'SpacesService', 'Log',
  function ($scope, SpacesService, Log) {

    $scope.devices = [{
      model: 'Activated',
      qty: ''
    }, {
      model: 'Pending',
      qty: ''
    }];

    var getAllRooms = function () {
      SpacesService.listDevices(function (data, status) {
        if (data.success) {
          var activated = 0;
          var pending = 0;
          if (data.devices) {
            for (var i = 0; i < data.devices.length; i++) {
              var device = data.devices[i];
              if (device.status === 'CLAIMED') {
                activated++;
              } else if (device.status === 'UNCLAIMED') {
                pending++;
              }
            }
          }
          $scope.devices[0].qty = activated;
          $scope.devices[1].qty = pending;
        } else {
          Log.error('Error getting rooms. Status: ' + status);
        }
      });
    };

    getAllRooms();

  }
]);
