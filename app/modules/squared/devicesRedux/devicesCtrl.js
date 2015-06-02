'use strict';
/* global moment, $ */

angular.module('Squared')
  .controller('DevicesCtrlRedux',

    /* @ngInject */
    function ($state, $location, Storage, Log, Utils, $filter, SpacesService, Notification, $log, $translate, CsdmService) {
      var vm = this;

      vm.totalResults = null;
      vm.showAdd = true;
      vm.emptyDevices = true;
      vm.roomData = null;

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

      vm.setDeleteDevice = function (deviceUuid, room) {
        vm.deleteDeviceUuid = deviceUuid;
        vm.deleteRoom = room;
      };

      vm.cancelDelete = function () {
        vm.deleteDeviceUuid = null;
        vm.deleteRoom = null;
      };

      vm.deleteDevice = function (deviceUuid, device) {
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
        CsdmService.listCodesAndDevices(function (err, data) {
          if (err) {
            return Log.error('Error getting rooms. Err: ' + err);
          }

          vm.roomData = _.map(data, function (device, id) {

            if (device.activationTime) {
              device.activationTimeFormatted = moment.utc(device.activationTime).local().format('MMM D YYYY, h:mm a');
            }

            if (device.activationCode) {
              device.activationCodeFormatted = formatActivationCode(device.activationCode);
            }

            if (device.state === 'CLAIMED') {
              device.stateFormatted = 'Offline';
            } else if (device.state === 'UNCLAIMED') {
              device.stateFormatted = 'Needs Activation';
              device.color = 'device-status-yellow';
            }

            return device;
          });

          // getDevicesStatus();

        });
      };

      getAllDevices();

      var getDevicesStatus = function () {
        for (var i = 0; i < vm.roomData.length; i++) {
          if (vm.roomData[i].status !== 'Needs Activation') {
            SpacesService.getDeviceStatus(vm.roomData[i].deviceUuid, i, function (data, i, status) {
              if (data.success === true) {
                if (data.cisUuid === vm.roomData[i].deviceUuid) {
                  vm.roomData[i].events = data.events;
                  if (data.status === 'reachable') {
                    vm.roomData[i].status = 'Active';
                    vm.roomData[i].color = 'device-status-green';
                  } else {
                    vm.roomData[i].status = 'Offline';
                    vm.roomData[i].color = 'device-status-gray';
                  }
                  vm.roomData[i].diagEvents = [];
                  for (var j = 0; j < data.events.length; j++) {
                    var event = data.events[j];
                    if (event.type.toLowerCase() === 'tcpfallback' && event.level.toLowerCase() != 'ok') {
                      vm.roomData[i].diagEvents.push({
                        'type': $translate.instant('spacesPage.videoQTitle'),
                        'message': $translate.instant('spacesPage.videoQMsg')
                      });
                      vm.roomData[i].status = 'Issues Detected';
                      vm.roomData[i].color = 'device-status-red';
                    }
                  }
                } else {
                  Log.error('table changed.');
                }
              } else {
                Log.error('Error getting device status. Status: ' + status);
              }
            });
          }
        }
      };

      // var rowTemplate = '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="sc.showDeviceDetails(row.entity)">' +
      //   '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
      //   '<div ng-cell></div>' +
      //   '</div>';

      // var roomTemplate = '<div class="ngCellText"><div class="device-name-desc">{{row.getProperty(col.field)}}</div></div>';

      // var deviceCellTemplate = '<div class="ngCellText"><img class="device-img" src="images/SX10.png"/><div class="device-icon-desc">SX10</div></div>';

      // var statusTemplate = '<i class="fa fa-circle device-status-icon ngCellText" ng-class="row.getProperty(\'color\')"></i>' +
      //   '<div ng-class="{\'device-status-nocode\': row.getProperty(col.field)!==\'Needs Activation\', \'ngCellText ngCellTextCustom\': row.getProperty(col.field) === \'Needs Activation\'}"><p class="device-status-pending">{{row.getProperty(col.field)}}</p>' +
      //   '<p ng-if="row.getProperty(col.field) === \'Needs Activation\'">{{row.getProperty(\'code\')}}</p></div>';

      // var actionsTemplate = '<span dropdown class="device-align-ellipses">' +
      //   '<button id="actionlink" class="btn-icon btn-actions dropdown-toggle" ng-click="$event.stopPropagation()" ng-class="dropdown-toggle">' +
      //   '<i class="icon icon-three-dots"></i>' +
      //   '</button>' +
      //   '<ul class="dropdown-menu dropdown-primary" role="menu">' +
      //   '<li id="deleteDeviceAction"><a data-toggle="modal" data-target="#deleteDeviceModal" ng-click="sc.setDeleteDevice(row.entity.deviceUuid, row.entity.room)"><span translate="spacesPage.delete"></span></a></li>' +
      //   '</ul>' +
      //   '</span>';

      // vm.newRoomName = null;
      // vm.gridOptions = {
      //   data: 'sc.roomData',
      //   multiSelect: false,
      //   showFilter: false,
      //   rowHeight: 75,
      //   headerRowHeight: 44,
      //   rowTemplate: rowTemplate,
      //   sortInfo: {
      //     fields: ['status'],
      //     directions: ['asc']
      //   },

      //   columnDefs: [{
      //     field: 'kind',
      //     displayName: $filter('translate')('spacesPage.kindHeader'),
      //     width: 260,
      //     cellTemplate: deviceCellTemplate,
      //     sortable: false
      //   }, {
      //     field: 'room',
      //     displayName: $filter('translate')('spacesPage.nameHeader'),
      //     cellTemplate: roomTemplate
      //   }, {
      //     field: 'status',
      //     displayName: $filter('translate')('spacesPage.statusHeader'),
      //     cellTemplate: statusTemplate
      //   }, {
      //     field: 'action',
      //     displayName: $filter('translate')('spacesPage.actionsHeader'),
      //     sortable: false,
      //     cellTemplate: actionsTemplate
      //   }]
      // };

      vm.showDeviceDetails = function (device) {
        vm.currentDevice = device;
        vm.querydeviceslist = vm.roomData;
        $state.go('device-overview-redux', {
          currentDevice: vm.currentDevice,
          querydeviceslist: vm.querydeviceslist
        });
      };

      vm.resetAddDevice = function () {
        vm.showAdd = true;
        $('#newRoom').val('');
        vm.newRoomName = null;
      };

      vm.addDevice = function () {
        SpacesService.addDevice(vm.newRoomName, function (data, status) {
          if (data.success === true) {
            vm.showAdd = false;
            if (data.activationCode && data.activationCode.length > 0) {
              vm.newActivationCode = formatActivationCode(data.activationCode);
            }
            var successMessage = vm.newRoomName + ' added successfully.';
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
            var errorMessage = ['Error adding ' + vm.newRoomName + '. Status: ' + status];
            Notification.notify(errorMessage, 'error');
          }
        });
      };
    }
  );
