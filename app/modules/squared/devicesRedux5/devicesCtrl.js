'use strict';

/* @ngInject */
function DevicesReduxCtrl($scope, $state, $location, $rootScope, CsdmCodeService, CsdmDeviceService, AddDeviceModal) {
  var vm = this;
  var pageSize = 18;

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

  vm.groups = [{
    pageSize: 6,
    displayName: 'Rooms',
    matches: function (device) {
      return device.type == 'group';
    },
  }];

  vm.groupedDevices = {};

  vm.updateCodesAndDevices = function () {
    vm.deviceList.length = 0;

    var allCodesAndDevices = _.chain({})
      .extend(CsdmDeviceService.getDeviceList())
      .extend(CsdmCodeService.getCodeList())
      .values()
      .value();

    var rooms = _.chain(allCodesAndDevices)
      .countBy('displayName')
      .pick(function (val) {
        return val > 1;
      })
      .value();

    var roomsAndDevices = _.chain(allCodesAndDevices)
      .filter(function (device) {
        return !rooms[device.displayName];
      })
      .concat(_.map(rooms, function (count, displayName) {
        return {
          count: count,
          type: 'group',
          displayName: displayName
        };
      }))
      .sortBy(displayNameSorter)
      .value();

    var groups = _.chain(roomsAndDevices)
      .reduce(function (result, device) {
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
              result[group.displayName].push(device);
              return true;
            }
          });
          if (!found) {
            vm.deviceList.push(device);
          }
        }
        return result;
      }, _.reduce(vm.groups, function (memo, group) {
        memo[group.displayName] = [];
        return memo;
      }, {}))
      .map(function (devices, displayName) {
        return _.chain(vm.groups)
          .find({
            displayName: displayName
          })
          .extend({
            devices: devices
          })
          .value();
      })
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
  };

  vm.codesListSubscription = CsdmCodeService.subscribe(vm.updateCodesAndDevices, {
    scope: $scope
  });

  vm.deviceListSubscription = CsdmDeviceService.subscribe(vm.updateCodesAndDevices, {
    scope: $scope
  });

  vm.findDeviceIndex = function (device) {
    // return device ? _.findIndex(vm.filteredCodesAndDevices.matches, {
    //   url: device.url
    // }) : -1;
  };

  vm.clearFilterIfNoSearch = function ($event) {
    if ($event.keyCode == 8 && !vm.search) {
      vm.clearDisplayNameFilter();
    }
  };

  vm.clearSearchAndFilter = function () {
    vm.search = undefined;
    vm.refreshResults();
    vm.clearDisplayNameFilter();
  };

  vm.clearDisplayNameFilter = function () {
    if (vm.displayNameFilter) {
      vm.displayNameFilter = undefined;
      vm.refreshResults();
    }
  };

  vm.refreshResults = function () {
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
    if (vm.groupedDevices.count == 1) {
      return $state.go('devices-redux5.details', {
        device: vm.groupedDevices.device
      });
    }
    if (~$location.path().indexOf('/details')) {
      return $state.go('devices-redux5.search');
    }
  }

  function displayNameSorter(p) {
    return ((p && p.displayName) || '').toLowerCase();
  }

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
