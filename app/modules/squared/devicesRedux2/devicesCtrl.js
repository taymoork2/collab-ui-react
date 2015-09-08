'use strict';

/* @ngInject */
function DevicesReduxCtrl2($scope, $state, $location, $rootScope, CsdmCodeService, CsdmDeviceService, PagerUtil) {
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
    if (filter.checked) {
      _.each(vm.filters, function (f) {
        if (filter != f) {
          f.checked = false;
        }
      });
    }
    vm.updateCodesAndDevices();
    transitionIfSearchOrFilterChanged();
    this.pager.firstPage();
  };

  vm.searchChanged = function () {
    vm.updateCodesAndDevices();
    transitionIfSearchOrFilterChanged();
    this.pager.firstPage();
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

function PagerUtil() {
  return function (opts) {

    this.update = function (opts) {
      opts = opts || {};
      this.pageSize = opts.pageSize || this.pageSize;
      this.resultSize = opts.resultSize || this.resultSize;

      if (!this.currentPage) {
        this.currentPage = this.resultSize ? 1 : 0;
      }

      this.pageCount = this.resultSize ? Math.floor(this.resultSize / this.pageSize) || 1 : (this.pageCount || 0);
      this.currentPageSize = this.pageSize + (this.currentPage == this.pageCount ? (this.resultSize - (this.currentPage * this.pageSize)) || 0 : 0);
      this.next = this.currentPage < this.pageCount;
      this.prev = this.currentPage > 1;
    };

    this.nextPage = function () {
      if (this.currentPage < this.pageCount) {
        this.currentPage++;
        this.update();
      }
    };

    this.prevPage = function () {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.update();
      }
    };

    this.firstPage = function () {
      this.currentPage = 1;
      this.update();
    };

    this.update(opts);
  };
}

angular
  .module('Squared')
  .service('PagerUtil', PagerUtil)
  .controller('DevicesReduxCtrl2', DevicesReduxCtrl2)
  .controller('DevicesReduxDetailsCtrl2', DevicesReduxDetailsCtrl2);
