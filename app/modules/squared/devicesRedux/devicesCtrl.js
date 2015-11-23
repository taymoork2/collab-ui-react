(function () {
  'use strict';

  angular
    .module('Squared')
    .controller('DevicesReduxCtrl', DevicesReduxCtrl);

  /* @ngInject */
  function DevicesReduxCtrl($scope, $state, $location, $rootScope, $window, CsdmCodeService, CsdmDeviceService, AddDeviceModal) {
    var vm = this;

    $('body').css('background', 'white');

    vm.deviceProps = {
      product: 'Product',
      software: 'Software',
      ip: 'IP',
      serial: 'Serial',
      mac: 'Mac',
      readableActivationCode: 'Activation Code',
      readableState: 'Status',
      diagnosticsEvent: 'Event',
      tagString: 'Tags'
    };

    vm.deviceList = [];
    vm.defaultPageSize = 18;
    vm.pageSize = vm.defaultPageSize;

    vm.groups = [{
      displayName: 'Devices with problems',
      matches: function (device) {
        return device.hasIssues && !vm.search;
      }
    }, {
      displayName: 'Rooms',
      matches: function (device) {
        return device.type == 'group';
      }
    }];

    vm.groupedDevices = {};

    vm.updateCodesAndDevices = function () {
      vm.deviceList.length = 0;

      var groups = _.chain({})
        .extend(CsdmDeviceService.getDeviceList())
        .extend(CsdmCodeService.getCodeList())
        .values()
        .filter(removeOldCodes)
        .filter(filterOnSearchQuery)
        .groupBy('displayName')
        .map(createRooms)
        .flatten()
        .sortBy(displayNameSorter)
        .reduce(groupDevices, {})
        .map(extendWithDisplayNameFromFilter)
        .value();

      vm.groupedDevices.groups = groups;

      vm.groupedDevices.count = _.reduce(groups, function (sum, group) {
        return sum + group.devices.length;
      }, 0);

      vm.groupedDevices.device = _.chain(groups)
        .pluck('devices')
        .flatten()
        .first()
        .value();

      function removeOldCodes(device) {
        if (device.needsActivation && !device.readableActivationCode) {
          return null;
        }
        return device;
      }

      function extendWithDisplayNameFromFilter(devices, displayName) {
        return _.chain(vm.groups)
          .find({
            displayName: displayName
          })
          .extend({
            devices: devices
          })
          .value();
      }

      function filterOnSearchQuery(device) {
        var searchFields = [
          'displayName',
          'software',
          'serial',
          'ip',
          'mac',
          'readableState',
          'readableActivationCode',
          'product',
          'diagnosticsEvent',
          'tagString'
        ];

        device.diagnosticsEvent = _.pluck(device.diagnosticsEvents, 'type')[0];

        var attributeMatches = !vm.search || _.find(searchFields, function (field) {
          if (~(device[field] || '').toLowerCase().indexOf(vm.search.toLowerCase())) {
            if (field != 'displayName') device.filterMatch = field;
            return true;
          }
        });

        if (attributeMatches) {
          return device;
        }
      }

      function groupDevices(result, device) {
        var found = _.find(vm.groups, function (group) {
          if (group.matches(device)) {
            if (!result[group.displayName]) {
              result[group.displayName] = [];
            }
            result[group.displayName].push(device);
            return true;
          }
        });
        if (!found) {
          vm.deviceList.push(device);
        }
        return result;
      }

      function createRooms(devices, displayName) {
        if (devices.length == 1) return devices[0];

        function matchesDisplayName(device) {
          return ~device.displayName.toLowerCase().indexOf(vm.search.toLowerCase());
        }

        if (vm.search && !_.all(devices, matchesDisplayName)) {
          return devices;
        }

        return {
          type: 'group',
          devices: devices,
          count: devices.length,
          displayName: displayName
        };
      }

    };

    vm.codesListSubscription = CsdmCodeService.on('data', vm.updateCodesAndDevices, {
      scope: $scope
    });

    vm.deviceListSubscription = CsdmDeviceService.on('data', vm.updateCodesAndDevices, {
      scope: $scope
    });

    vm.clearSearch = function () {
      vm.search = undefined;
      vm.refreshResults();
    };

    vm.refreshResults = function () {
      vm.pageSize = vm.defaultPageSize;
      vm.updateCodesAndDevices();
      transitionIfSearchOrFilterChanged();
    };

    vm.showAddDeviceDialog = function () {
      AddDeviceModal.open();
    };

    vm.expandDevice = function (device) {
      $state.go('devices-redux.details', {
        device: device
      });
    };

    function transitionIfSearchOrFilterChanged() {
      if (vm.groupedDevices.count + vm.deviceList.length == 1) {
        return $state.go('devices-redux.details', {
          device: vm.deviceList[0] || vm.groupedDevices.device
        });
      }
      if (~$location.path().indexOf('/details')) {
        return $state.go('devices-redux.search');
      }
    }

    function displayNameSorter(p) {
      return ((p && p.displayName) || '').toLowerCase();
    }

    vm.exportToCsv = function () {
      var fields = ['cisUuid', 'displayName', 'needsActivation', 'readableState', 'readableActivationCode', 'ip', 'mac', 'serial', 'software'];
      var csv = fields.join(';') + '\r\n';

      var devices = _.chain(vm.groupedDevices.groups)
        .pluck('devices')
        .flatten()
        .map(function (d) {
          return d.devices || d;
        })
        .flatten()
        .concat(vm.deviceList)
        .value();

      _.each(devices, function (item) {
        _.each(fields, function (field) {
          csv += (item[field] || '') + ';';
        });
        csv += '\r\n';
      });
      $window.location = 'data:text/csv;charset=utf-8,' + $window.encodeURIComponent(csv);
    };

    vm.updateCodesAndDevices();
  }
})();
