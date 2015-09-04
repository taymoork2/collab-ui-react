'use strict';

/* @ngInject */
function DevicesReduxCtrl2($scope, $state, $location, $rootScope, CsdmCodeService, CsdmDeviceService) {
  var vm = this;

  vm.filteredCodesAndDevices = [];

  vm.filters = [{
    label: 'All',
    filter: function () {
      return true;
    }
  }, {
    label: 'Online',
    filter: function (device) {
      return device.isOnline;
    }
  }, {
    label: 'Offline',
    filter: function (device) {
      return !device.isOnline && !device.needsActivation;
    }
  }, {
    label: 'Needs Activation',
    filter: function (device) {
      return device.needsActivation;
    }
  }];

  vm.updateCodesAndDevices = function () {
    vm.filteredCodesAndDevices = _.chain({})
      .extend(CsdmDeviceService.getDeviceList())
      .extend(CsdmCodeService.getCodeList())
      .values()
      .reduce(reduceFn, {
        matches: [],
        countPerFilter: _.reduce(vm.filters, function (initialCount, filter) {
          initialCount[filter.label] = 0;
          return initialCount;
        }, {})
      })
      .value();
    vm.filterOrSearchActive = vm.search || _.where(vm.filters, {
      checked: true
    }).length;
  };

  function reduceFn(result, device) {
    var displayNameMatches = !vm.search || ~device.displayName.toLowerCase().indexOf(vm.search.toLowerCase());
    var filterMatches = _.chain(vm.filters)
      .where({
        checked: true
      })
      .all(function (filter) {
        return filter.filter(device);
      })
      .value();
    if (displayNameMatches && filterMatches) {
      result.matches.push(device);
    }
    _.each(vm.filters, function (f) {
      if (f.filter(device) && displayNameMatches) {
        result.countPerFilter[f.label]++;
      }
    });
    return result;
  }

  function filterfn(device) {
    var displayNameMatches = !vm.search || ~device.displayName.toLowerCase().indexOf(vm.search.toLowerCase());
    var filterMatches = _.chain(vm.filters)
      .where({
        checked: true
      })
      .all(function (filter) {
        return filter.filter(device);
      })
      .value();
    return displayNameMatches && filterMatches;
  }

  vm.codesListSubscription = CsdmCodeService.subscribe(vm.updateCodesAndDevices, {
    scope: $scope
  });

  vm.deviceListSubscription = CsdmDeviceService.subscribe(vm.updateCodesAndDevices, {
    scope: $scope
  });

  vm.findDeviceIndex = function (device) {
    return device ? _.findIndex(vm.filteredCodesAndDevices.matches, {
      url: device.url
    }) : -1;
  };

  vm.filterChanged = function (filter) {
    filter.checked = !filter.checked;
    if (filter.checked) {
      _.each(vm.filters, function (f) {
        if (filter != f) {
          f.checked = false;
        }
      });
    }
    vm.updateCodesAndDevices();
    transitionIfSearchOrFilterChanged();
  };

  vm.searchChanged = function () {
    vm.updateCodesAndDevices();
    transitionIfSearchOrFilterChanged();
  };

  function transitionIfSearchOrFilterChanged() {
    if (vm.filteredCodesAndDevices.matches.length == 1) {
      return $state.go('devices-redux2.details', {
        device: vm.filteredCodesAndDevices.matches[0]
      });
    }
    if (~$location.path().indexOf('/details')) {
      return $state.go('devices-redux2.search');
    }
  }

  vm.updateCodesAndDevices();
}

/* @ngInject */
function DevicesReduxDetailsCtrl2($stateParams, $state) {
  var vm = this;

  if ($stateParams.device) {
    vm.device = $stateParams.device;
  } else {
    $state.go('devices-redux2.search');
  }
}

angular
  .module('Squared')
  .controller('DevicesReduxCtrl2', DevicesReduxCtrl2)
  .controller('DevicesReduxDetailsCtrl2', DevicesReduxDetailsCtrl2);
