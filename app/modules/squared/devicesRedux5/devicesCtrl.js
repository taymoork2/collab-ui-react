'use strict';

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
    readableState: 'Status'
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
      .groupBy('displayName')
      .map(groupAsDeviceOrRoom)
      .reduce(bfFilterFn, {})
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

    function bfFilterFn(result, device) {
      var searchFields = ['displayName', 'software', 'serial', 'ip', 'mac', 'readableState', 'readableActivationCode', 'product'];
      var someAttributeMatches = !vm.search || _.some(searchFields, function (field) {
        return ~(device[field] || '').toLowerCase().indexOf(vm.search.toLowerCase());
      });
      device.filterMatch = _.find(searchFields, function (field) {
        return vm.search && field != 'displayName' && ~(device[field] || '').toLowerCase().indexOf(vm.search.toLowerCase());
      });
      if (someAttributeMatches) {
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
      }
      return result;
    }

    function groupAsDeviceOrRoom(devices, displayName) {
      if (devices.length == 1) {
        return devices[0];
      } else {
        return {
          type: 'group',
          devices: devices,
          count: devices.length,
          displayName: displayName
        };
      }
    }

  };

  vm.codesListSubscription = CsdmCodeService.subscribe(vm.updateCodesAndDevices, {
    scope: $scope
  });

  vm.deviceListSubscription = CsdmDeviceService.subscribe(vm.updateCodesAndDevices, {
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
    $state.go('devices-redux5.details', {
      device: device
    });
  };

  function transitionIfSearchOrFilterChanged() {
    if (vm.groupedDevices.count + vm.deviceList.length == 1) {
      return $state.go('devices-redux5.details', {
        device: vm.deviceList[0] || vm.groupedDevices.device
      });
    }
    if (~$location.path().indexOf('/details')) {
      return $state.go('devices-redux5.search');
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

/* @ngInject */
function DevicesReduxDetailsCtrl($stateParams, $state, $window, RemDeviceModal, Utils, CsdmDeviceService, Authinfo, FeedbackService, XhrNotificationService) {
  var vm = this;

  if ($stateParams.device) {
    vm.device = $stateParams.device;
  } else {
    $state.go('devices-redux5.search');
  }

  vm.deviceProps = {
    software: 'Software',
    ip: 'IP',
    serial: 'Serial',
    mac: 'Mac'
  };

  vm.reportProblem = function () {
    var feedbackId = Utils.getUUID();

    return CsdmDeviceService.uploadLogs(vm.device.url, feedbackId, Authinfo.getPrimaryEmail())
      .then(function () {
        var appType = 'Atlas_' + $window.navigator.userAgent;
        return FeedbackService.getFeedbackUrl(appType, feedbackId);
      })
      .then(function (res) {
        $window.open(res.data.url, '_blank');
      })
      .catch(XhrNotificationService.notify);
  };

  vm.deleteDevice = function () {
    RemDeviceModal
      .open(vm.device)
      .then(function () {
        $state.go('devices-redux5.search');
      });
  };

}

function HighlightFilter() {
  return function (input, term) {
    if (input && term) {
      var regex = new RegExp('(' + term + ')', 'gi');
      return input.replace(regex, "<span class='hl'>$1</span>");
    }
    return input;
  };
}

angular
  .module('Squared')
  .filter('highlight', HighlightFilter)
  .controller('DevicesReduxCtrl5', DevicesReduxCtrl)
  .controller('DevicesReduxDetailsCtrl5', DevicesReduxDetailsCtrl);
