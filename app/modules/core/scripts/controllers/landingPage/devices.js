'use strict';

angular.module('Core')

.controller('DevicesCtrl', ['$scope', 'SpacesService', 'Log', 'Notification', '$translate',
  function($scope, SpacesService, Log, Notification, $translate) {

    $scope.devices = [{
      model: 'Activated',
      qty: 15
    }, {
      model: 'Pending',
      qty: 38
    }];

    var getAllRooms = function() {
      SpacesService.listRooms(function(data, status) {
        if (data.success === true) {
          var activated = 0;
          var pending = 0;
          var devices = [];
          if (data.devices) {
            for (var i = 0; i < data.devices.length; i++) {
              var device = data.devices[i];
              var adate = device.activationTime;
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