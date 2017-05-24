import { SearchFields, SearchObject } from '../services/csdmSearch.service';
class DeviceList implements ng.IComponentController {
  public searchObject: SearchObject;
  public devices;
  private _groupedDevices: { displayName: string, devices?: any, matches: (device) => {} }[] = [];
  private currentOffset = {};
  private pageSize = 20;

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

  /* @ngInject */
  constructor() {

  }

  public $onInit(): void {

  }

  public $onChanges() {
    this.updateCodesAndDevices();
  }

  private get search(): string {
    return this.searchObject && this.searchObject.query || '';
  }

  get groupedDevices(): { displayName: string; devices?: any; matches: ((device) => {}) }[] {
    // this.updateCodesAndDevices();
    return this._groupedDevices;
  }

  private groups = [{
    displayName: 'Devices with problems',
    matches: (device) => {
      return device.connectionStatus === 'CONNECTED_WITH_ISSUES' && !this.search;
    },
  }, {
    displayName: 'Rooms',
    matches: (device) => {
      return device.type === 'group' || device.accountType === 'MACHINE';
    },
  }, {
    displayName: 'Personal Devices',
    matches: (device) => {
      return (!device.hasIssues || this.search) && device.accountType !== 'MACHINE';
    },
  }];

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

    // this.CsdmDataModelService.getDevicesMap(true).then((devices) => {
    const devicesAndCodesArr = _(this.devices)
      .extend(this.devices)
      .filter(this.filterOnSearchQuery.bind(this))
      .groupBy('cisUuid')
      .map(createRooms)
      .flatten()
      .sortBy(this.displayNameSorter.bind(this))
      .value();
    this._groupedDevices = _(this.groups)
      .cloneDeep()
      .map((group: any) => {
        group.devices = _.filter(devicesAndCodesArr, (obj) => {
          return group.matches(obj);
        });
        return group;
      })
      .filter((group) => {
        return !!group && group.devices.length > 0;
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

    const attributeMatches = !this.search
      || _.find(_.keys(this.searchObject.tokenizedQuery), (field) => {
        if (field === SearchFields[SearchFields.any]) {
          return false;
        }
        if (this.searchObject.tokenizedQuery && this.searchObject.tokenizedQuery[field]) {
          if (0 <= this.getFilterMatchValue(device, field).toLowerCase().indexOf(this.searchObject.tokenizedQuery[field].toLowerCase())) {
            if (field !== 'displayName') {
              device.filterMatch = field;
            }
            return true;
          }
        }
      })
      || _.find(searchFields,
        (field) => {
          if (this.searchObject.tokenizedQuery && this.searchObject.tokenizedQuery[SearchFields[SearchFields.any]]) {
            if (0 <= this.getFilterMatchValue(device, field).toLowerCase().indexOf(this.search.toLowerCase())) {
              if (field !== 'displayName') {
                device.filterMatch = field;
              }
              return true;
            }
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
    // this.search = undefined;
    this.searchChanged();
  }

  public searchChanged() {
    // this.search = search || this.search;
    this.currentOffset = {};
    this.updateCodesAndDevices();
    this.transitionIfSearchOrFilterChanged();
  }

  public showAddDeviceDialog() {
    // this.AddDeviceModal.open(); //TODO no adding avail
  }

  public expandDevice(device) {
    device = device;
    // this.$state.go('devices-redux.details', {
    //   device: device,
    // });
  }

  public transitionIfSearchOrFilterChanged() {
    if (this._groupedDevices.length === 1 && this._groupedDevices[0].devices.length === 1) {
      return this.expandDevice(_(this._groupedDevices)
        .map('devices')
        .flatten()
        .first(),
      );
    }
    // if (0 <= this.$location.path().indexOf('/details')) {
    //   return this.$state.go('devices-redux.search');
    // }
  }

  public displayNameSorter(p) {
    return ((p && p.displayName) || '').toLowerCase();
  }
}

export class DeviceListComponent implements ng.IComponentOptions {
  public controller = DeviceList;
  public bindings = {
    devices: '<',
    searchObject: '<',
  };
  public controllerAs = 'lctrl';
  public templateUrl = 'modules/csdm/devicesRedux/list.html';
}
