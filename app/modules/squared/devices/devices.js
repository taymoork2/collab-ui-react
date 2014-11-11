'use strict';
/* global moment, $ */

angular.module('Squared')
  .controller('SpacesCtrl', ['$scope', '$location', 'Storage', 'Log', 'Utils', '$filter', 'SpacesService', 'Notification', 'Config',
    function ($scope, $location, Storage, Log, Utils, $filter, SpacesService, Notification, Config) {

      //Populating authinfo data if empty.
      var token = Storage.get('accessToken');
      $scope.totalResults = 0;
      $scope.showAdd = true;

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

      var getAllRooms = function () {
        SpacesService.listRooms(function (data, status) {
          if (data.success === true) {
            var devices = [];
            if (data.devices) {
              $scope.totalResults = data.devices.length;
              for (var i = 0; i < data.devices.length; i++) {
                var device = data.devices[i];
                var adate = device.activationTime;
                if (adate && adate.length > 0) {
                  adate = moment.utc(adate).local().format('MMM D YYYY, h:mm a');
                }

                var activationCode = device.activationCode;
                if (activationCode && activationCode.length > 0) {
                  activationCode = formatActivationCode(activationCode);
                }

                var color, deviceStatus;
                if (device.status === 'CLAIMED') {
                  deviceStatus = 'Active';
                } else if (device.status === 'UNCLAIMED') {
                  deviceStatus = 'Pending Activation: ';
                }

                devices.push({
                  'room': device.accountName,
                  'code': activationCode,
                  'status': deviceStatus,
                  'activationDate': adate,
                  'color': color
                });
              }
            }
            $scope.roomData = devices;
          } else {
            Log.error('Error getting rooms. Status: ' + status);
          }
        });
      };

      getAllRooms();

      var roomTemplate = '<div class="ngCellText"><div class="device-name-desc">{{row.getProperty(col.field)}}</div></div>';

      var deviceCellTemplate = '<div class="ngCellText"><img class="device-img" src="images/SX10.png"/><div class="device-icon-desc">SX10</div></div>';

      var statusTemplate = '<i class="fa fa-circle device-status-icon ngCellText" ng-class="{\'device-status-green\': row.getProperty(col.field)===\'Active\', \'device-status-red\': row.getProperty(col.field) !== \'Active\'}"></i>' +
        '<div ng-class="{\'device-status-nocode\': row.getProperty(col.field)===\'Active\', \'ngCellText ngCellTextCustom\': row.getProperty(col.field) !== \'Active\'}"><p class="device-status-pending">{{row.getProperty(col.field)}}</p>' +
        '<p ng-if="row.getProperty(col.field) !== \'Active\'">{{row.getProperty(\'code\')}}</p></div>';

      var actionsTemplate = '<span dropdown class="device-align-ellipses">' +
        '<button class="btn-icon btn-actions dropdown-toggle" ng-click="$event.stopPropagation()" ng-class="dropdown-toggle">' +
        '<i class="icon icon-three-dots"></i>' +
        '</button>' +
        '</span>';

      $scope.newRoomName = null;
      $scope.gridOptions = {
        data: 'roomData',
        multiSelect: false,
        showFilter: false,
        rowHeight: 75,
        headerRowHeight: 44,
        sortInfo: {
          fields: ['status'],
          directions: ['asc']
        },

        columnDefs: [{
          field: 'kind',
          displayName: $filter('translate')('spacesPage.kindHeader'),
          width: 260,
          cellTemplate: deviceCellTemplate,
          sortable: false
        }, {
          field: 'room',
          displayName: $filter('translate')('spacesPage.nameHeader'),
          cellTemplate: roomTemplate
        }, {
          field: 'status',
          displayName: $filter('translate')('spacesPage.statusHeader'),
          cellTemplate: statusTemplate
        }, {
          field: 'action',
          displayName: $filter('translate')('spacesPage.actionsHeader'),
          sortable: false,
          cellTemplate: ''
        }]
      };

      Notification.init($scope);
      $scope.popup = Notification.popup;

      $scope.resetAddDevice = function () {
        $scope.showAdd = true;
        $('#newRoom').val('');
        $scope.newRoomName = null;
      };

      $scope.addRoom = function () {
        SpacesService.addRoom($scope.newRoomName, function (data, status) {
          if (data.success === true) {
            $scope.showAdd = false;
            if (data.activationCode && data.activationCode.length > 0) {
              $scope.newActivationCode = formatActivationCode(data.activationCode);
            }
            var successMessage = [$scope.newRoomName + ' added successfully.'];
            Notification.notify(successMessage, 'success');
            setTimeout(function () {
              getAllRooms();
            }, 1000);
          } else {
            var errorMessage = ['Error adding ' + $scope.newRoomName + '. Status: ' + status];
            Notification.notify(errorMessage, 'error');
          }
        });
      };
    }
  ]);
