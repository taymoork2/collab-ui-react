namespace devicesRedux {

  class DevicesReduxCtrl {

    private _search;
    private pageSize = 10;
    private groupedDevices;
    private subscriptions = [];
    private currentOffset = {};
    private csdmHuronOrgDeviceService = null;
    private deviceProps = {
      product: 'Product',
      software: 'Software',
      ip: 'IP',
      serial: 'Serial',
      mac: 'Mac',
      readableState: 'Status',
      diagnosticsEvent: 'Event',
      tagString: 'Tags'
    };

    private groups = [{
      displayName: 'Devices with problems',
      matches: (device) => device.hasIssues && !this.search
    }, {
      displayName: 'Rooms',
      matches: (device) => device.type == 'group'
    }, {
      displayName: 'Devices',
      matches: (device) => !device.hasIssues || this.search
    }];

    /* @ngInject */
    constructor(private $scope,
                private $state,
                private $window,
                private $location,
                private Authinfo,
                private AddDeviceModal,
                private CsdmCodeService,
                private CsdmDeviceService,
                private CsdmHuronOrgDeviceService,
                private CsdmUnusedAccountsService) {

      // hack until toolkit supports #fff background
      $('body').css('background', 'white');

      this.subscriptions.push(CsdmCodeService.on('data', this.updateCodesAndDevices.bind(this), {
        scope: $scope
      }));

      this.subscriptions.push(CsdmDeviceService.on('data', this.updateCodesAndDevices.bind(this), {
        scope: $scope
      }));

      this.csdmHuronOrgDeviceService = CsdmHuronOrgDeviceService.create(Authinfo.getOrgId());
      this.subscriptions.push(this.csdmHuronOrgDeviceService.on('data', this.updateCodesAndDevices.bind(this), {
        scope: $scope
      }));
    }

    get search() {
      return this._search;
    }

    set search(search) {
      this._search = search;
    }

    get anyDevicesOrCodesLoaded() {
      let total = _.sum(this.groupedDevices, (group:any) => group.devices.length);
      return total || _.sum(this.subscriptions, 'eventCount') >= 3;
    }

    get subscriptionErrorsExist() {
      return _.any(this.subscriptions, 'currentError');
    }


    updateCodesAndDevices() {
      function createRooms(devices, displayName) {
        if (devices.length == 1) return devices[0];

        function matchesDisplayName(device) {
          return ~device.displayName.toLowerCase().indexOf(this.search.toLowerCase());
        }

        if (this.search && !_.all(devices, matchesDisplayName)) {
          return devices;
        }

        return {
          type: 'group',
          devices: devices,
          count: devices.length,
          displayName: displayName
        };
      }
      const devicesAndCodesArr = _({})
        .extend(this.CsdmDeviceService.getDeviceList())
        .extend(this.CsdmCodeService.getCodeList())
        .extend(this.csdmHuronOrgDeviceService.getDeviceList())
        .extend(this.CsdmUnusedAccountsService.getAccountList())
        .values()
        .filter(this.filterOnSearchQuery.bind(this))
          .groupBy('displayName')
          .map(createRooms)
          .flatten()
          .sortBy(this.displayNameSorter.bind(this))
        .value();

      this.groupedDevices = _(this.groups)
        .cloneDeep()
        .map((group:any) => {
          group.devices = _.filter(devicesAndCodesArr, (obj) => {
            return group.matches(obj);
          });
          return group;
        })
        .filter((group) => {
          return group.devices.length;
        });
    };

    filterOnSearchQuery(device) {
      const searchFields = [
        'displayName',
        'software',
        'serial',
        'ip',
        'mac',
        'readableState',
        'product',
        'diagnosticsEvent',
        'tagString'
      ];

      device.diagnosticsEvent = _.pluck(device.diagnosticsEvents, 'type')[0];

      const attributeMatches = !this.search || _.find(searchFields, (field) => {
        if (~(device[field] || '').toLowerCase().indexOf(this.search.toLowerCase())) {
          if (field != 'displayName') device.filterMatch = field;
          return true;
        }
      });

      if (attributeMatches) return device;
    };

    offsetForGroup(group) {
      return this.currentOffset[group.displayName] || this.pageSize;
    };

    increaseOffsetForGroup(group) {
      this.currentOffset[group.displayName] = this.offsetForGroup(group) + this.pageSize;
    };

    clearSearch () {
      this.search = undefined;
      this.searchChanged();
    };

    searchChanged() {
      this.currentOffset = {};
      this.updateCodesAndDevices();
      this.transitionIfSearchOrFilterChanged();
    };

    showAddDeviceDialog () {
      this.AddDeviceModal.open();
    };

    expandDevice (device) {
      this.$state.go('devices-redux.details', {
        device: device
      });
    };

    transitionIfSearchOrFilterChanged() {
      if (this.groupedDevices.length == 1 && this.groupedDevices[0].devices.length == 1) {
        return this.expandDevice(_(this.groupedDevices)
          .pluck('devices')
          .flatten()
          .first()
        );
      }
      if (~this.$location.path().indexOf('/details')) {
        return this.$state.go('devices-redux.search');
      }
    }

    displayNameSorter(p) {
      return ((p && p.displayName) || '').toLowerCase();
    }

    exportToCsv() {
      const fields = ['cisUuid', 'displayName', 'needsActivation', 'readableState', 'ip', 'mac', 'serial', 'software'];

      const devices = _(this.groupedDevices)
        .pluck('devices')
        .flatten()
        .map((d) => d.devices || d)
        .flatten()
        .value();

      const csv = _.reduce(devices, (csv, device) => {
        return csv += _.reduce(fields.reverse(), (str, field) => {
          return (device[field] || '') + ';' + str;
        }, '\r\n');
      }, fields.join(';') + '\r\n');

      this.$window.location = 'data:text/csv;charset=utf-8,' + this.$window.encodeURIComponent(csv);
    };
  }

  angular
    .module('Squared')
    .controller('DevicesReduxCtrl', DevicesReduxCtrl);

}
