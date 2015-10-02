'use strict';

/* @ngInject */
function DevicesReduxCtrl($scope, $state, $location, $rootScope, CsdmCodeService, CsdmDeviceService, PagerUtil, AddDeviceModal) {
  var vm = this;
  var pageSize = 18;

  $('body').css('background', 'white');

  vm.pager = new PagerUtil({
    resultSize: 0,
    pageSize: pageSize
  });

  vm.deviceProps = {
    product: 'Product',
    software: 'Software',
    ip: 'IP',
    serial: 'Serial',
    mac: 'Mac',
    readableActivationCode: 'Activation Code',
    readableState: 'Status'
  };

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
      .sortBy(displayNameSorter)
      .reduce(reduceFn, {
        rooms: [],
        devices: [],
        matches: [],
        countPerFilter: _.reduce(vm.filters, function (initialCount, filter) {
          initialCount[filter.label] = 0;
          return initialCount;
        }, {})
      })
      .value();

    if (!vm.search && !vm.displayNameFilter) {
      var rooms = _.chain(vm.filteredCodesAndDevices.matches)
        .countBy('displayName')
        .pick(function (val) {
          return val > 1;
        })
        .value();

      vm.filteredCodesAndDevices.devices = _.chain(vm.filteredCodesAndDevices.matches)
        .filter(function (device) {
          return !rooms[device.displayName];
        })
        .sortBy(displayNameSorter)
        .value();

      vm.filteredCodesAndDevices.rooms = _.chain({})
        .extend(_.map(rooms, function (count, displayName) {
          return {
            displayName: displayName,
            count: count,
            type: 'group'
          };
        }))
        .sortBy(displayNameSorter)
        .value();
    } else {
      vm.filteredCodesAndDevices.devices = vm.filteredCodesAndDevices.matches;
    }

    vm.filterOrSearchActive = vm.search || _.where(vm.filters, {
      checked: true
    }).length;

    vm.pager.update({
      resultSize: vm.filteredCodesAndDevices.matches.length
    });

  };

  function reduceFn(result, device) {
    var searchFields = ['displayName', 'software', 'serial', 'ip', 'mac', 'readableState', 'readableActivationCode', 'product'];

    var someAttributeMatches = !vm.search || _.some(searchFields, function (field) {
      return ~(device[field] || '').toLowerCase().indexOf(vm.search.toLowerCase());
    });

    device.filterMatch = _.find(searchFields, function (field) {
      return vm.search && field != 'displayName' && ~(device[field] || '').toLowerCase().indexOf(vm.search.toLowerCase());
    });

    var filterMatches = _.chain(vm.filters)
      .where({
        checked: true
      })
      .all(function (filter) {
        return filter.filter(device);
      })
      .value();

    var displayNameFilterMatches = !vm.displayNameFilter || device.displayName == vm.displayNameFilter;

    if (someAttributeMatches && filterMatches && displayNameFilterMatches) {
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
    vm.refreshResults();
  };

  vm.clearFilterIfNoSearch = function ($event) {
    if ($event.keyCode == 8 && !vm.search) {
      if (vm.displayNameFilter) {
        vm.clearDisplayNameFilter();
      } else {
        vm.clearFilter();
      }
    }
  };

  vm.clearSearchAndFilter = function () {
    vm.search = undefined;
    vm.refreshResults();
    vm.clearFilter();
    vm.clearDisplayNameFilter();
  };

  vm.clearFilter = function () {
    if (vm.currentFilter) {
      vm.currentFilter.checked = true;
      vm.filterChanged(vm.currentFilter);
    }
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
    this.pager.firstPage();
  };

  vm.showAddDeviceDialog = function () {
    AddDeviceModal.open();
  };

  vm.expandDevice = function (device) {
    if (device.type == 'group') {
      vm.displayNameFilter = device.displayName;
      vm.refreshResults();
    } else {
      $state.go('devices-redux4.details', {
        device: device
      });
    }
  };

  function transitionIfSearchOrFilterChanged() {
    if (vm.filteredCodesAndDevices.matches.length == 1) {
      return $state.go('devices-redux4.details', {
        device: vm.filteredCodesAndDevices.matches[0]
      });
    }
    if (~$location.path().indexOf('/details')) {
      return $state.go('devices-redux4.search');
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
    $state.go('devices-redux4.search');
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
        $state.go('devices-redux4.search');
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
  .controller('DevicesReduxCtrl4', DevicesReduxCtrl)
  .controller('DevicesReduxDetailsCtrl4', DevicesReduxDetailsCtrl);
