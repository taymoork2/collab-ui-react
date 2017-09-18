import { IGridApi } from 'ui-grid';
import { SearchObject } from '../services/search/searchObject';
import { SearchHits } from '../services/search/searchResult';
import { Caller, CsdmSearchService } from '../services/csdmSearch.service';
import { IOnChangesObject } from 'angular';
import { DeviceSearch } from './deviceSearch.component';
import { GridCellService } from '../../core/csgrid/cs-grid-cell/gridCell.service';
import IDevice = csdm.IDevice;
import { Device } from '../services/deviceSearchConverter';

class DeviceList implements ng.IComponentController {
  private static RowHeight = 45;
  private static HeaderHeight = 45;

  private huronDeviceService: any;
  public gridOptions: uiGrid.IGridOptions;
  public gridApi: uiGrid.IGridApi;
  public loadingMore = false;
  public loadingMoreSpinner = false;

  //bindings
  public searchObject: SearchObject = SearchObject.createWithQuery('');
  public searchHits: SearchHits;
  public sortOrderChanged: (e?: { field: string, order: string }) => {};

  /* @ngInject */
  constructor(private $state,
              private CsdmSearchService: CsdmSearchService,
              private $templateCache,
              private $translate,
              CsdmHuronOrgDeviceService,
              private $scope,
              private $window: Window,
              private Notification,
              private GridCellService: GridCellService,
              Authinfo) {
    this.huronDeviceService = CsdmHuronOrgDeviceService.create(Authinfo.getOrgId());
    this.gridOptions = {
      data: this.getResult(),
      useExternalSorting: true,
      rowHeight: DeviceList.RowHeight,
      appScopeProvider: {
        selectRow: (grid: uiGrid.IGridInstance, row: uiGrid.IGridRow): void => {
          this.GridCellService.selectRow(grid, row);
          this.expandDevice(row.entity);
        },
        expandDevice: (device: IDevice) => {
          this.expandDevice(device);
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
        });
      },
      columnDefs: [{
        field: 'photos',
        displayName: '',
        cellTemplate: this.getTemplate('_imageTpl'),
        width: 70,
      }, {
        field: 'displayName',
        displayName: this.$translate.instant('spacesPage.nameHeader'),
        suppressRemoveSort: true,
        cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.expandDevice(row.entity)" cell-value="row.entity.displayName"></cs-grid-cell>',
      }, {
        field: 'connectionStatus',
        displayName: this.$translate.instant('spacesPage.statusHeader'),
        cellTemplate: this.getTemplate('_statusTpl'),
        sort: { // This has no effect on the actual sorting, but makes the grid reflect the default sort in searchObject.ts
          direction: 'asc',
          priority: 0,
        },
        suppressRemoveSort: true,
      }, {
        field: 'product',
        displayName: this.$translate.instant('spacesPage.typeHeader'),
        cellTemplate: this.getTemplate('_productTpl'),
        suppressRemoveSort: true,
      }],
    };
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
    }
  }

  public getResult() {
    return this.searchHits && this.searchHits.hits;
  }

  private getTemplate(name) {
    return this.$templateCache.get('modules/csdm/templates/' + name + '.html');
  }

  public expandDevice(device) {
    this.$state.go('device-overview', {
      currentDevice: device,
      huronDeviceService: this.huronDeviceService,
      deviceDeleted: this.deviceDeleted(this.searchHits),
    });
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

  private loadMore(fromScrollEvent = false) {
    this.searchObject.nextPage();
    if ((this.searchObject.from || 0) < (this.searchHits && this.searchHits.total || 0) && !this.loadingMore) {
      this.loadingMore = true;
      this.loadingMoreSpinner = fromScrollEvent;
      this.CsdmSearchService.search(this.searchObject, Caller.searchOrLoadMore)
        .then((response) => {
          if (response && response.data) {
            this.searchHits.hits.push.apply(this.searchHits.hits, response.data.hits.hits);
          }
        })
        .catch(e => DeviceSearch.ShowSearchError(this.Notification, e))
        .finally(() => {
          if (
            (this.gridApi.grid.gridHeight || 0) > (DeviceList.HeaderHeight + DeviceList.RowHeight * this.searchHits.hits.length)
            && ((this.searchObject.from || 0) + this.searchHits.hits.length) < this.searchHits.total) {
            this.loadMore(fromScrollEvent);
          }
          this.loadingMore = false;
          this.loadingMoreSpinner = false;
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
  public templateUrl = 'modules/csdm/devicesRedux/list.html';
}
