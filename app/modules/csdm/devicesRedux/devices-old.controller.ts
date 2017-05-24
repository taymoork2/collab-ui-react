import { CsdmDataModelService } from '../../squared/devices/services/CsdmDataModelService';
require('./_devices.scss');

export class DevicesReduxCtrl {

  private _search;
  private pageSize = 10;
  private groupedDevices: { displayName: string, devices?: any, matches: (device) => {} }[] = [];
  private subscriptions = [];
  private currentOffset = {};

  public deviceProps = {
    product: 'Product',
    software: 'Software',
    ip: 'IP',
    serial: 'Serial',
    mac: 'Mac',
    readableState: 'Status',
    diagnosticsEvent: 'Event',
    tagString: 'Tags',
  };

  private groups = [{
    displayName: 'Devices with problems',
    matches: (device) => {
      return device.hasIssues && !this.search;
    },
  }, {
    displayName: 'Rooms',
    matches: (device) => {
      return device.type === 'group' || device.accountType === 'MACHINE';
    },
  }, {
    //   displayName: 'Personal Devices',
    //   matches: (device) => {
    //     return device.type === 'group' || device.accountType === 'PERSON';
    //   },
    // }, {
    displayName: 'Personal Devices',
    matches: (device) => {
      return (!device.hasIssues || this.search) && device.accountType !== 'MACHINE';
    },
  }];

  /* @ngInject */
  constructor(// $scope,
    private $state,
    private $window,
    private $location,
    private CsdmDataModelService: CsdmDataModelService) {

    // hack until toolkit supports #fff background
    $('body').css('background', 'white');

    //TODO add in poller remove update
    this.updateCodesAndDevices();
  }

  get search() {
    return this._search;
  }

  set search(search) {
    this._search = search;
  }

  get anyDevicesOrCodesLoaded() {
    const total = _.sumBy(this.groupedDevices, (group: any) => {
      return group.devices && group.devices.length || 0;
    });
    return total || this.search; //_.sumBy(this.subscriptions, 'eventCount') >= 1;
  }

  get subscriptionErrorsExist() {
    return _.some(this.subscriptions, 'currentError');
  }

  public updateCodesAndDevices() {
    const createRooms = (devices, displayName) => {
      if (devices.length === 1) {
        return devices[0];
      }

      const matchesDisplayName = (device) => {
        {
          return 0 <= device.displayName.toLowerCase().indexOf(this.search.toLowerCase());
        }
      };

      if (this.search && !_.every(devices, matchesDisplayName)) {
        return devices;
      }

      return {
        type: 'group',
        devices: devices,
        count: devices.length,
        displayName: displayName,
      };
    };

    this.CsdmDataModelService.getDevicesMap(true).then((devices) => {
      const devicesAndCodesArr = _({})
        .extend(devices)
        .values()
        .filter(this.filterOnSearchQuery.bind(this))
        .groupBy('cisUuid')
        .map(createRooms)
        .flatten()
        .sortBy(this.displayNameSorter.bind(this))
        .value();
      this.groupedDevices = _(this.groups)
        .cloneDeep()
        .map((group: any) => {
          group.devices = _.filter(devicesAndCodesArr, (obj) => {
            return group.matches(obj);
          });
          return group;
        })
        .filter((group) => {
          return !!group; //group.devices.length;
        });
    });
  }

  public filterOnSearchQuery(device) {
    const searchFields = [
      'displayName',
      'software',
      'serial',
      'ip',
      'mac',
      // 'readableState',
      'product',
      'diagnosticsEvent',
      'tags',
      'state.readableState',
      'diagnosticsEvent',
    ];

    device.diagnosticsEvent = _.map(device.diagnosticsEvents, 'type')[0];

    const attributeMatches = !this.search || _.find(searchFields,
        (field) => {
          if (0 <= this.getFilterMatchValue(device, field).toLowerCase().indexOf(this.search.toLowerCase())) {
            if (field !== 'displayName') {
              device.filterMatch = field;
            }
            return true;
          }
        });

    if (attributeMatches) {
      return device;
    }
  }

  public getFilterMatchValue(device, field): string {
    const val: any = _.get(device, field || device.filterMatch, '');
    if (val instanceof Array) {
      return val.toString();
    }
    return val;
  }

  public offsetForGroup(group) {
    return this.currentOffset[group.displayName] || this.pageSize;
  }

  public increaseOffsetForGroup(group) {
    this.currentOffset[group.displayName] = this.offsetForGroup(group) + this.pageSize;
  }

  public getIcon(device) {
    switch (device.cssColorClass) {
      case 'warning':
        return 'icon-warning';
      case 'danger':
        return 'icon-error';
      case 'success':
        return 'icon-check';
      default:
        return 'icon-circle';
    }
  }

  public clearSearch() {
    this.search = undefined;
    this.searchChanged();
  }

  public searchChanged(search?: string) {
    this.search = search || this.search;
    this.currentOffset = {};
    this.updateCodesAndDevices();
    this.transitionIfSearchOrFilterChanged();
  }

  public showAddDeviceDialog() {
    // this.AddDeviceModal.open(); //TODO no adding avail
  }

  public expandDevice(device) {
    this.$state.go('devices-redux.details', {
      device: device,
    });
  }

  public transitionIfSearchOrFilterChanged() {
    if (this.groupedDevices.length === 1 && this.groupedDevices[0].devices.length === 1) {
      return this.expandDevice(_(this.groupedDevices)
        .map('devices')
        .flatten()
        .first(),
      );
    }
    if (0 <= this.$location.path().indexOf('/details')) {
      return this.$state.go('devices-redux.search');
    }
  }

  public displayNameSorter(p) {
    return ((p && p.displayName) || '').toLowerCase();
  }

  public exportToCsv() {
    const fields = ['cisUuid', 'displayName', 'needsActivation', 'readableState', 'ip', 'mac', 'serial', 'software'];

    const devices = _(this.groupedDevices)
      .map('devices')
      .flatten()
      .map((d: any) => d.devices || d)
      .flatten()
      .value();

    const csv = _.reduce(devices, (csv, device) => {
      return csv += _.reduce(fields.reverse(), (str, field) => {
        return (device[field] || '') + ';' + str;
      }, '\r\n');
    }, fields.join(';') + '\r\n');

    this.$window.location = 'data:text/csv;charset=utf-8,' + this.$window.encodeURIComponent(csv);
  }
}
