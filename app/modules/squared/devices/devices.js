'use strict';
/* global moment, $ */

angular.module('Squared')
  .controller('SpacesCtrl', ['$scope', '$location', 'Storage', 'Log', 'Utils', '$filter', 'SpacesService', 'Notification', 'Config',
    function ($scope, $location, Storage, Log, Utils, $filter, SpacesService, Notification, Config) {

      //Populating authinfo data if empty.

      var token = Storage.get('accessToken');
      $scope.totalResults = null;
      $scope.showAdd = true;
      $scope.emptyDevices = true;

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

      $scope.setDeleteDevice = function (deviceUuid, room) {
        $scope.deleteDeviceUuid = deviceUuid;
        $scope.deleteRoom = room;
      };

      $scope.cancelDelete = function () {
        $scope.deleteDeviceUuid = null;
        $scope.deleteRoom = null;
      };

      $scope.deleteDevice = function (deviceUuid, device) {
        SpacesService.deleteDevice(deviceUuid, function (data, status) {
          if (data.success === true) {
            var successMessage = device + ' deleted successfully.';
            Notification.notify([successMessage], 'success');
            setTimeout(function () {
              getAllDevices();
            }, 1000);
          } else {
            var errorMessage = ['Error deleting ' + device + '. Status: ' + status];
            Notification.notify(errorMessage, 'error');
          }
        });
      };

      var getAllDevices = function () {
        SpacesService.listDevices(function (data, status) {
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
                  'deviceUuid': device.accountCisUuid,
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

      getAllDevices();

      var roomTemplate = '<div class="ngCellText"><div class="device-name-desc">{{row.getProperty(col.field)}}</div></div>';

      var deviceCellTemplate = '<div class="ngCellText"><img class="device-img" src="images/SX10.png"/><div class="device-icon-desc">SX10</div></div>';

      var statusTemplate = '<i class="fa fa-circle device-status-icon ngCellText" ng-class="{\'device-status-green\': row.getProperty(col.field)===\'Active\', \'device-status-red\': row.getProperty(col.field) !== \'Active\'}"></i>' +
        '<div ng-class="{\'device-status-nocode\': row.getProperty(col.field)===\'Active\', \'ngCellText ngCellTextCustom\': row.getProperty(col.field) !== \'Active\'}"><p class="device-status-pending">{{row.getProperty(col.field)}}</p>' +
        '<p ng-if="row.getProperty(col.field) !== \'Active\'">{{row.getProperty(\'code\')}}</p></div>';

      var actionsTemplate = '<span dropdown class="device-align-ellipses">' +
        '<button id="actionlink" class="btn-icon btn-actions dropdown-toggle" ng-click="$event.stopPropagation()" ng-class="dropdown-toggle">' +
        '<i class="icon icon-three-dots"></i>' +
        '</button>' +
        '<ul class="dropdown-menu dropdown-primary" role="menu">' +
        '<li id="deleteDeviceAction"><a data-toggle="modal" data-target="#deleteDeviceModal" ng-click="setDeleteDevice(row.entity.deviceUuid, row.entity.room)"><span translate="spacesPage.delete"></span></a></li>' +
        '</ul>' +
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
          cellTemplate: actionsTemplate
        }]
      };

      Notification.init($scope);
      $scope.popup = Notification.popup;

      $scope.resetAddDevice = function () {
        $scope.showAdd = true;
        $('#newRoom').val('');
        $scope.newRoomName = null;
      };

      $scope.addDevice = function () {
        SpacesService.addDevice($scope.newRoomName, function (data, status) {
          if (data.success === true) {
            $scope.showAdd = false;
            if (data.activationCode && data.activationCode.length > 0) {
              $scope.newActivationCode = formatActivationCode(data.activationCode);
            }
            var successMessage = $scope.newRoomName + ' added successfully.';
            // Notification requires change to accomodate displaying 2nd line with different font size.
            // for now change the font inline in the message.
            if (data.emailConfCode === undefined && data.conversationId === undefined) {
              successMessage = successMessage + '<br><p style="font-size:xx-small">Notifications failed.</p>';
            }
            Notification.notify([successMessage], 'success');
            setTimeout(function () {
              getAllDevices();
            }, 1000);
          } else {
            var errorMessage = ['Error adding ' + $scope.newRoomName + '. Status: ' + status];
            Notification.notify(errorMessage, 'error');
          }
        });
      };
    }
  ]);
