'use strict';

/* @ngInject */
function DevicesReduxCtrl($scope, $state, $location, $rootScope, $window, CsdmCodeService, CsdmDeviceService, AddDeviceModal, TagService) {
  var vm = this;

  $('body').css('background', 'white');

  vm.tags = {
    listTags: function (id) {
      return TagService.list(id);
    },
    createTag: function (id, $event) {
      var tag = _.trim(vm.tags.newTag);
      if ($event.keyCode == 13 && tag) {
        TagService.add(id, tag);
        vm.tags.newTag = undefined;
      }
    },
    removeTag: function (id, tag) {
      TagService.remove(id, tag);
    }
  };

  vm.deviceProps = {
    product: 'Product',
    software: 'Software',
    ip: 'IP',
    serial: 'Serial',
    mac: 'Mac',
    readableActivationCode: 'Activation Code',
    readableState: 'Status',
    diagnosticsEvent: 'Event',
    tags: 'Tags'
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
      // include tags
      .map(addTags)
      // filter based on search
      .map(filterOnSearchQuery)
      .compact()
      // create rooms of devices with equal names
      .groupBy('displayName')
      .map(createRooms)
      .flatten()
      // group devices
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

    function addTags(device) {
      device.tags = TagService.list(device.url).join(', ');
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
        'tags'
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

function TagService($window) {
  var id = '___tags';

  var rawTags = $window.localStorage.getItem(id);
  var tags = rawTags ? JSON.parse(rawTags) : {};

  function writeTags() {
    $window.localStorage.setItem(id, JSON.stringify(tags));
  }

  function list(id) {
    tags[id] = tags[id] || [];
    return tags[id];
  }

  function add(id, tag) {
    tags[id] = tags[id] || [];
    if (!_.includes(tags[id], tag)) {
      tags[id].push(tag);
    }
    writeTags();
  }

  function remove(id, tag) {
    tags[id] = tags[id] || [];
    tags[id] = _.without(tags[id], tag);
    writeTags();
  }

  return {
    add: add,
    list: list,
    remove: remove
  };
}

angular
  .module('Squared')
  .service('TagService', TagService)
  .filter('highlight', HighlightFilter)
  .controller('DevicesReduxCtrl5', DevicesReduxCtrl)
  .controller('DevicesReduxDetailsCtrl5', DevicesReduxDetailsCtrl);
