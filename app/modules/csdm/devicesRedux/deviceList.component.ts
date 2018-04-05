import { IGridApi } from 'ui-grid';
import { SearchObject } from '../services/search/searchObject';
import { SearchHits } from '../services/search/searchResult';
import { Caller, CsdmSearchService } from '../services/csdmSearch.service';
import { IOnChangesObject } from 'angular';
import { DeviceSearch } from './deviceSearch.component';
import { GridCellService } from '../../core/csgrid/cs-grid-cell/gridCell.service';
import IDevice = csdm.IDevice;
import { Device, DeviceSearchConverter, IIdentifiableDevice } from '../services/deviceSearchConverter';
import { BulkAction, CsdmBulkService } from '../services/csdmBulk.service';
import { Dictionary } from 'lodash';

class DeviceList implements ng.IComponentController {
  private devicePlaceLink: boolean;
  private static RowHeight = 45;
  private static HeaderHeight = 45;

  private huronDeviceService: any;
  public gridOptions: uiGrid.IGridOptions;
  public gridApi: uiGrid.IGridApi;
  public loadingMore = false;
  public loadingMoreSpinner = false;
  public selectAllSpinner = false;
  public selectedDevices: Dictionary<IIdentifiableDevice> = {};
  private allDevicesIdsFromSearch: Dictionary<IIdentifiableDevice> = {};
  private bulkAll: boolean | null = false;

  public get bulkSelectionCount() {
    return _.size(this.selectedDevices);
  }

  //bindings
  public searchObject: SearchObject;
  public searchHits: SearchHits;
  public sortOrderChanged: (e?: { field: string, order: string }) => {};

  /* @ngInject */
  constructor(private $state,
              private CsdmSearchService: CsdmSearchService,
              private CsdmBulkService: CsdmBulkService,
              private $translate,
              CsdmHuronOrgDeviceService,
              private $scope,
              private $window: Window,
              private Notification,
              private GridCellService: GridCellService,
              private DeviceSearchConverter: DeviceSearchConverter,
              private FeatureToggleService,
              private Analytics,
              Authinfo) {

    this.FeatureToggleService.csdmDevicePlaceLinkGetStatus().then((result: boolean) => {
      this.devicePlaceLink = result;
    });
    this.FeatureToggleService.csdmBulkGetStatus().then((enableBulk) => {
      if (this.gridOptions.columnDefs) {
        this.gridOptions.columnDefs[0].visible = enableBulk;
        this.gridApi.core.refresh();
      }
    });
    this.huronDeviceService = CsdmHuronOrgDeviceService.create(Authinfo.getOrgId());
    this.gridOptions = {
      data: this.getResult(),
      useExternalSorting: true,
      enableRowSelection: false,
      enableRowHeaderSelection: false,
      multiSelect: false,
      rowHeight: DeviceList.RowHeight,
      appScopeProvider: {
        selectRow: (grid: uiGrid.IGridInstance, row: uiGrid.IGridRow): void => {
          this.GridCellService.selectRow(grid, row);
          this.expandDevice(row.entity);
        },
        expandDevice: (device: IDevice) => {
          this.expandDevice(device);
        },
        toggleSelectAll: () => {
          this.bulkAll = !(this.bulkAll === null || this.bulkAll);
          if (!this.bulkAll) {
            this.resetBulkSelection();
          } else {
            this.selectedDevices = _.keyBy<IIdentifiableDevice>(this.getResult(), (d) => this.extractDeviceId(d));
          }
          this.handleSelections();
        },
        allSelected: (getClass: boolean) => {
          if (!getClass) {
            const selection = this.bulkAll;
            const o = {
              get value() {
                return selection;
              },
              set value(_value) {

              },
            };
            return o;
          }
          if (this.bulkAll) {
            return 'checked';
          } else if (this.bulkAll === null) {
            return 'indeterminate';
          }
          return '';
        },
        toggleBulkSelection: (device: IDevice) => {
          if (!device) {
            return;
          }
          const deviceId = this.extractDeviceId(device);
          if (
            _.isUndefined(this.selectedDevices[deviceId])) {
            this.selectedDevices[deviceId] = device;
            this.bulkAll = _.size(this.selectedDevices) === _.size(this.allDevicesIdsFromSearch)
              ? true
              : null;
          } else {
            delete this.selectedDevices[deviceId];
            this.bulkAll = _.size(this.selectedDevices) === 0 ? false : null;
          }
          this.handleSelections();
        },
        isSelected: (device: IDevice) => {
          const deviceId: string = this.extractDeviceId(device);
          const selection = this.bulkAll || (device && !_.isUndefined(this.selectedDevices[deviceId]));
          const o = {
            get value() {
              return selection;
            },
            set value(_value) {

            },
          };
          return o;
        },
      },
      onRegisterApi: (gridApi: IGridApi) => {
        this.gridApi = gridApi;
        gridApi.core.on.sortChanged(this.$scope, (_grid, sortColumns) => {
          let sortedSortColumns = sortColumns;
          if (sortColumns.length > 1) {
            sortedSortColumns = _.orderBy(sortColumns, 'sort.priority', 'desc');
            _.forEach(_.tail(sortedSortColumns), (columnToUnsort) => {
              columnToUnsort.sort = {};
            });
          }
          const sortColumn = _.first(sortedSortColumns);
          if (sortColumn) {
            this.sortOrderChanged({
              field: sortColumn.field || '',
              order: sortColumn.sort && sortColumn.sort.direction || 'asc',
            });
            return;
          }
          this.sortOrderChanged({ field: '', order: '' });
        });
        gridApi.core.on.scrollEnd(this.$scope, (scrollEvent: IJQueryMouseEventObjectWithNewScrollTop) => {
          if ((gridApi.grid.gridHeight || 0) + scrollEvent.newScrollTop > (this.getResult() || []).length * DeviceList.RowHeight) {
            this.loadMore(true);
          }
          if (this.gridApi.selection.getSelectAllState()) {
            this.gridApi.selection.selectAllRows();
          }
        });
      },
      rowTemplate: require('modules/csdm/templates/_rowTpl.html'),
      columnDefs: [
        {
          displayName: '',
          field: 'selection',
          cellTemplate: require('modules/csdm/templates/_selectionTpl.html'),
          width: 70,
          visible: false,
          enableSorting: false,
          headerCellTemplate: require('modules/csdm/templates/_selectionHeaderTpl.html'),
        },
        {
          field: 'photos',
          displayName: '',
          cellTemplate: require('modules/csdm/templates/_imageTpl.html'),
          width: 70,
        }, {
          field: 'displayName',
          displayName: this.$translate.instant('spacesPage.nameHeader'),
          suppressRemoveSort: true,
          cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.expandDevice(row.entity)" cell-value="row.entity.displayName"></cs-grid-cell>',
        }, {
          field: 'connectionStatus',
          displayName: this.$translate.instant('spacesPage.statusHeader'),
          cellTemplate: require('modules/csdm/templates/_statusTpl.html'),
          sort: { // This has no effect on the actual sorting, but makes the grid reflect the default sort in searchObject.ts
            direction: 'asc',
            priority: 0,
          },
          suppressRemoveSort: true,
        }, {
          field: 'product',
          displayName: this.$translate.instant('spacesPage.typeHeader'),
          cellTemplate: require('modules/csdm/templates/_productTpl.html'),
          suppressRemoveSort: true,
        }],
    };
  }

  private extractDeviceId(device: csdm.IDevice | IIdentifiableDevice) {
    return device.url;
  }

  private handleSelections() {
    if (this.bulkAll === false) {
      if (this.$state.sidepanel) {
        this.$state.sidepanel.close();
      }
    } else if (this.bulkAll) {
      this.selectAllSpinner = true;
      this.CsdmBulkService.getIds(this.searchObject).then((response) => {
        if (response && response.data) {
          this.selectedDevices = _.keyBy<any>(response.data.deviceIdentifiers, (uri) => uri);
          this.allDevicesIdsFromSearch = _.keyBy<any>(response.data.deviceIdentifiers, (uri) => uri);
          if (this.$state.sidepanel) {
            this.expandBulk(); //re expanding
          }
        }
        this.selectAllSpinner = false;
      });
    } else {
      if (this.$state.sidepanel) {
        this.expandBulk(); //re expanding
      }
    }
  }

  public $onInit(): void {
  }

  public $onChanges(onChangesObj: IOnChangesObject) {
    if (onChangesObj.searchHits && this.gridApi && this.searchHits && this.searchHits.hits) {
      this.gridOptions.data = this.getResult();
      this.gridApi.core.refreshRows().then(() => {
        if (this.gridOptions && this.gridOptions.columnDefs && this.gridOptions.data) {

          const elements = this.$window.document.getElementsByClassName('ui-grid-viewport');
          if (elements && elements[0]) {
            elements[0].scrollTop = 0;
          }
        }
      });

      if ((this.gridApi && this.gridApi.grid.gridHeight || 0) > (DeviceList.HeaderHeight + DeviceList.RowHeight * 20)) {
        this.loadMore();
      }
      this.resetBulkSelection();
    }
  }

  public getResult(): Device[] {
    return this.searchHits && this.searchHits.hits;
  }

  private resetBulkSelection() {
    this.bulkAll = false;
    this.selectedDevices = {};
  }

  public expandBulk() {
    this.$state.go('bulk-overview', {
      selectedDevices: this.selectedDevices,
      devicesDeleted: this.devicesDeleted(this.searchHits),
    });
  }

  public bulkDelete() {
    this.$state.go('deviceBulkFlow.delete', {
      selectedDevices: this.selectedDevices,
      devicesDeleted: this.devicesDeleted(this.searchHits),
    });
  }

  public expandDevice(device) {
    if (this.devicePlaceLink && device.accountType === 'MACHINE') {
      this.$state.go('place-overview.csdmDevice', {
        currentPlace: this.DeviceSearchConverter.createPlaceholderPlace(device),
        currentDevice: device,
        huronDeviceService: this.huronDeviceService,
        deviceDeleted: this.deviceDeleted(this.searchHits),
      });
      this.trackExpandDevice(device);
    } else {
      this.$state.go('device-overview', {
        currentDevice: device,
        huronDeviceService: this.huronDeviceService,
        deviceDeleted: this.deviceDeleted(this.searchHits),
      });
      this.trackExpandDevice(device);
    }
  }

  public deviceDeleted(searchHits) {
    return function (url) {
      if (searchHits && searchHits.hits) {
        _.remove(searchHits.hits, (device: Device) => {
          return device.url === url;
        });
      }
    };
  }

  public devicesDeleted(searchHits): (bulkAction: BulkAction, sucessfullyDeleted: Dictionary<IIdentifiableDevice>) => void {
    return (_action: BulkAction, sucessfullyDeleted: Dictionary<IIdentifiableDevice>) => {
      if (searchHits && searchHits.hits) {
        _.remove(searchHits.hits, (device: Device) => {
          return sucessfullyDeleted.hasOwnProperty(device.url);
        });
        _.forEach(sucessfullyDeleted, (_sd, k: string) => {
          delete this.selectedDevices[k];
        });
        if (_.size(sucessfullyDeleted) > 0) {
          this.bulkAll = false;
        }
      }
    };
  }

  private trackExpandDevice(device: IDevice) {
    this.Analytics.trackEvent(this.Analytics.sections.DEVICE_SEARCH.eventNames.EXPAND_DEVICE, {
      device_type: device && device.accountType,
      device_status: device && device.cssColorClass,
    });
  }

  private loadMore(fromScrollEvent = false) {
    this.searchObject.nextPage();
    if ((this.searchObject.from || 0) < (this.searchHits && this.searchHits.total || 0) && !this.loadingMore) {
      this.loadingMore = true;
      this.loadingMoreSpinner = fromScrollEvent;
      this.CsdmSearchService.search(this.searchObject, Caller.searchOrLoadMore)
        .then((response) => {
          if (response && response.data) {
            this.searchHits.hits.push.apply(this.searchHits.hits, response.data.hits.hits);
            DeviceSearch.ShowPartialSearchErrors(response.data, this.Notification);
          }
        })
        .catch(e => DeviceSearch.ShowSearchError(this.Notification, e.data && e.data.trackingId))
        .finally(() => {
          if (
            (this.gridApi.grid.gridHeight || 0) > (DeviceList.HeaderHeight + DeviceList.RowHeight * this.searchHits.hits.length)
            && ((this.searchObject.from || 0) + this.searchHits.hits.length) < this.searchHits.total) {
            this.loadMore(fromScrollEvent);
          }
          this.loadingMore = false;
          this.loadingMoreSpinner = false;
          if (this.gridApi.selection.getSelectAllState()) {
            this.gridApi.selection.selectAllRows();
          }
        });
    }
  }
}

interface IJQueryMouseEventObjectWithNewScrollTop extends JQueryMouseEventObject {
  newScrollTop: number;
}

export class DeviceListComponent implements ng.IComponentOptions {
  public controller = DeviceList;
  public bindings = {
    searchHits: '<',
    searchObject: '<',
    sortOrderChanged: '&',
  };
  public controllerAs = 'lctrl';
  public template = require('modules/csdm/devicesRedux/list.html');
}
