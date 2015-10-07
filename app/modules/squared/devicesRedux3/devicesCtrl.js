'use strict';

/* @ngInject */
function DevicesReduxCtrl($scope, $state, $location, $rootScope, CsdmCodeService, CsdmDeviceService, PagerUtil, AddDeviceModal) {
  var vm = this;

  vm.pager = new PagerUtil({
    resultSize: 0,
    pageSize: 10
  });

  vm.filteredCodesAndDevices = [];

  vm.filters = [{
    label: 'All',
    filter: function () {
      return true;
    }
  }, {
    label: 'Has Issues',
    filter: function (device) {
      return device.hasIssues;
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
      .sortBy('displayName')
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
    vm.pager.update({
      resultSize: vm.filteredCodesAndDevices.matches.length
    });
  };

  function reduceFn(result, device) {
    var searchFields = ['displayName', 'software', 'serial', 'ip', 'mac'];
    var someAttributeMatches = !vm.search || _.some(searchFields, function (field) {
      return ~(device[field] || '').toLowerCase().indexOf(vm.search.toLowerCase());
    });
    var filterMatches = _.chain(vm.filters)
      .where({
        checked: true
      })
      .all(function (filter) {
        return filter.filter(device);
      })
      .value();
    if (someAttributeMatches && filterMatches) {
      result.matches.push(device);
    }
    _.each(vm.filters, function (f) {
      if (f.filter(device) && someAttributeMatches) {
        result.countPerFilter[f.label]++;
      }
    });
    return result;
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
    _.each(vm.filters, function (f) {
      if (filter.checked) {
        if (filter != f) {
          f.checked = false;
        } else {
          vm.currentFilter = f;
        }
      } else {
        vm.currentFilter = undefined;
      }
    });
    vm.updateCodesAndDevices();
    transitionIfSearchOrFilterChanged();
    this.pager.firstPage();
  };

  vm.clearFilterIfNoSearch = function ($event) {
    if ($event.keyCode == 8 && !vm.search) {
      if (vm.currentFilter) {
        vm.currentFilter.checked = true;
        vm.filterChanged(vm.currentFilter);
      }
    }
  };

  vm.clearSearchAndFilter = function () {
    vm.search = undefined;
    vm.searchChanged();
    if (vm.currentFilter) {
      vm.currentFilter.checked = true;
      vm.filterChanged(vm.currentFilter);
    }
  };

  vm.searchChanged = function () {
    vm.updateCodesAndDevices();
    transitionIfSearchOrFilterChanged();
    this.pager.firstPage();
  };

  vm.showAddDeviceDialog = function () {
    AddDeviceModal.open();
  };

  function transitionIfSearchOrFilterChanged() {
    if (vm.filteredCodesAndDevices.matches.length == 1) {
      return $state.go('devices-redux3.details', {
        device: vm.filteredCodesAndDevices.matches[0]
      });
    }
    if (~$location.path().indexOf('/details')) {
      return $state.go('devices-redux3.search');
    }
  }

  vm.updateCodesAndDevices();
}

/* @ngInject */
function DevicesReduxDetailsCtrl($stateParams, $state, $window, RemDeviceModal, Utils, CsdmDeviceService, Authinfo, FeedbackService, XhrNotificationService) {
  var vm = this;

  if ($stateParams.device) {
    vm.device = $stateParams.device;
  } else {
    $state.go('devices-redux3.search');
  }

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
        $state.go('devices-redux3.search');
      });
  };
}

angular
  .module('Squared')
  .controller('DevicesReduxCtrl3', DevicesReduxCtrl)
  .controller('DevicesReduxDetailsCtrl3', DevicesReduxDetailsCtrl);
