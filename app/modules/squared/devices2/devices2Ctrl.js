'use strict';
/* global moment, $ */

angular.module('Squared')
  .controller('Devices2Ctrl', ['$state', '$location', 'Storage', 'Log', 'Utils', '$filter', 'DevicesService', 'Notification', '$log', '$translate',
    function ($state, $location, Storage, Log, Utils, $filter, DevicesService, Notification, $log, $translate) {
      var vm = this;

      vm.totalResults = null;
      vm.showAdd = true;
      vm.deviceData = [];
      vm.devices = [];
      vm.codes = [];

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

      vm.setDelete = function (entity) {
        vm.deleteEntity = entity;
      };

      vm.cancelDelete = function () {
        vm.deleteEntity = null;
      };

      vm.delete = function (entity) {
        DevicesService.deleteUrl(entity.url, function (success, status) {
          var ind;
          if (success === true) {
            if (entity.state === 'UNCLAIMED') {
              ind = vm.codes.indexOf(entity);
              if (ind > -1) {
                vm.codes.splice(ind, 1);
              }
            } else {
              ind = vm.devices.indexOf(entity);
              if (ind > -1) {
                vm.devices.splice(ind, 1);
              }
            }
            updateDeviceList(vm.codes, vm.devices);
            var successMessage = entity.displayName + ' deleted successfully.';
            Notification.notify([successMessage], 'success');
          } else {
            var errorMessage = ['Error deleting ' + entity.displayName + '. Status: ' + status];
            Notification.notify(errorMessage, 'error');
          }
        });
      };

      function updateDeviceList(codes, devices) {
        vm.deviceData = devices.concat(codes);
        vm.totalResults = vm.deviceData.length;
      }

      var getAllDevices = function () {
        vm.devices = [];
        vm.codes = [];
        DevicesService.listDevices(function (data, status, success) {
          if (success) {
            vm.devices = _.map(data, function (device, url) {
              if (device.status !== undefined) {
                if (device.status.connectionStatus === 'connected') {
                  if (device.status.level === 'ok') {
                    device.color = 'device-status-green';
                    device.displayStatus = 'online';
                  } else {
                    device.color = 'device-status-red';
                    device.displayStatus = 'Issues Detected';
                  }
                } else {
                  device.color = 'device-status-gray';
                  device.displayStatus = 'offline';
                }
              } else {
                device.color = 'device-status-gray';
                device.displayStatus = 'offline';
              }
              return device;
            });
            updateDeviceList(vm.codes, vm.devices);
          } else {
            Log.error('Error getting devices. Status: ' + status);
          }
        });
        DevicesService.listCodes(function (data, status, success) {
          if (success) {
            vm.codes = _.map(data, function (code, url) {
              code.color = 'device-status-yellow';
              code.displayStatus = 'Needs Activation';
              code.formattedActivationCode = formatActivationCode(code.activationCode);
              return code;
            });
            updateDeviceList(vm.codes, vm.devices);
          } else {
            Log.error('Error getting activation codes. Status: ' + status);
          }
        });
        updateDeviceList(vm.codes, vm.devices);
      };

      getAllDevices();

      var rowTemplate = '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="dc.showDeviceDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }"></div>' +
        '<div ng-cell></div>' +
        '</div>';

      var roomTemplate = '<div class="ngCellText"><div class="device-name-desc">{{row.getProperty(col.field)}}</div></div>';

      var deviceCellTemplate = '<div class="ngCellText"><img class="device-img" src="images/SX10.png"/><div class="device-icon-desc">SX10</div></div>';

      var statusTemplate = '<i class="fa fa-circle device-status-icon ngCellText" ng-class="row.getProperty(\'color\')"></i>' +
        '<div ng-class="{\'device-status-nocode\': row.getProperty(col.field)!==\'Needs Activation\', \'ngCellText ngCellTextCustom\': row.getProperty(col.field) === \'Needs Activation\'}"><p class="device-status-pending">{{row.getProperty(col.field)}}</p>' +
        '<p ng-if="row.getProperty(col.field) === \'Needs Activation\'">{{row.getProperty(\'formattedActivationCode\')}}</p></div>';

      var actionsTemplate = '<span dropdown class="device-align-ellipses">' +
        '<button id="actionlink" class="btn-icon btn-actions dropdown-toggle" ng-click="$event.stopPropagation()" ng-class="dropdown-toggle">' +
        '<i class="icon icon-three-dots"></i>' +
        '</button>' +
        '<ul class="dropdown-menu dropdown-primary" role="menu">' +
        '<li id="deleteDeviceAction"><a data-toggle="modal" data-target="#deleteDeviceModal" ng-click="dc.setDelete(row.entity)"><span translate="spacesPage.delete"></span></a></li>' +
        '</ul>' +
        '</span>';

      vm.newRoomName = null;
      vm.gridOptions = {
        data: 'dc.deviceData',
        multiSelect: false,
        showFilter: false,
        rowHeight: 75,
        headerRowHeight: 44,
        rowTemplate: rowTemplate,
        sortInfo: {
          fields: ['displayStatus'],
          directions: ['asc']
        },

        columnDefs: [{
          field: 'kind',
          displayName: $filter('translate')('spacesPage.kindHeader'),
          width: 260,
          cellTemplate: deviceCellTemplate,
          sortable: false
        }, {
          field: 'displayName',
          displayName: $filter('translate')('spacesPage.nameHeader'),
          cellTemplate: roomTemplate
        }, {
          field: 'displayStatus',
          displayName: $filter('translate')('spacesPage.statusHeader'),
          cellTemplate: statusTemplate
        }, {
          field: 'action',
          displayName: $filter('translate')('spacesPage.actionsHeader'),
          sortable: false,
          cellTemplate: actionsTemplate
        }]
      };

      vm.showDeviceDetails = function (entity) {
        //Service profile
        vm.currentEntity = entity;
        vm.querydeviceslist = vm.deviceData;
        $state.go('devices2-overview', {
          currentEntity: vm.currentEntity,
          querydeviceslist: vm.querydeviceslist
        });
      };

      vm.resetAddCode = function () {
        vm.showAdd = true;
        $('#newRoom').val('');
        vm.newRoomName = null;
      };

      vm.addCode = function () {
        DevicesService.createCode(vm.newRoomName, function (data, status) {
          if (data.success) {
            vm.showAdd = false;
            if (data.activationCode && data.activationCode.length > 0) {
              vm.newActivationCode = formatActivationCode(data.activationCode);
            }
            var successMessage = vm.newRoomName + ' added successfully.';
            // Notification requires change to accomodate displaying 2nd line with different font size.
            // for now change the font inline in the message.
            // if (data.emailConfCode === undefined && data.conversationId === undefined) {
            //   successMessage = successMessage + '<br><p style="font-size:xx-small">Notifications failed.</p>';
            // }
            Notification.notify([successMessage], 'success');

            var code = data;
            code.color = 'device-status-yellow';
            code.displayStatus = 'Needs Activation';
            code.formattedActivationCode = formatActivationCode(code.activationCode);
            vm.codes.push(code);
            updateDeviceList(vm.codes, vm.devices);
          } else {
            var errorMessage = ['Error adding ' + vm.newRoomName + '. Status: ' + status];
            Notification.notify(errorMessage, 'error');
          }
        });
      };
    }
  ]);
