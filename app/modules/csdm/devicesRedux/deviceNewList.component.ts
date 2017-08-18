import { IGridApi } from 'ui-grid';
import { CsdmConverter } from '../../squared/devices/services/CsdmConverter';
import { SearchObject } from '../services/search/searchObject';
import { SearchHits } from '../services/search/searchResult';
import { CsdmSearchService } from '../services/csdmSearch.service';
class DeviceNewList implements ng.IComponentController {

  private huronDeviceService: any;
  public gridOptions;
  public gridApi: uiGrid.IGridApi;
  public loadingMore = false;

  //bindings
  public searchObject: SearchObject;
  public searchHits: SearchHits;
  public sortOrderChanged: (e?: { field: string, order: string }) => {};
  /* @ngInject */
  constructor(private $state,
              private $http,
              private CsdmSearchService: CsdmSearchService,
              private CsdmConverter: CsdmConverter,
              private $templateCache,
              private $translate,
              CsdmHuronOrgDeviceService,
              private $scope,
              Authinfo) {
    this.huronDeviceService = CsdmHuronOrgDeviceService.create(Authinfo.getOrgId());
    this.gridOptions = {
      data: 'lctrl.getResult()',
      infiniteScrollRowsFromEnd: 5,
      infiniteScrollDown: true,
      useExternalSorting: true,
      enableHorizontalScrollbar: 0,
      rowHeight: 45,
      enableRowHeaderSelection: false,
      enableColumnMenus: false,
      multiSelect: false,
      onRegisterApi: (gridApi: IGridApiWithInfiniteScroll) => {
        this.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged(this.$scope, (row) => {
          this.expandDevice(row.entity);
        });
        gridApi.infiniteScroll.on.needLoadMoreData(this.$scope, () => {
          if (!this.searchObject) {
            this.searchObject = SearchObject.create('');
          }
          this.searchObject.nextPage();
          if ((this.searchObject.from || 0) < (this.searchHits && this.searchHits.total || 0)) {
            this.loadingMore = true;
            this.CsdmSearchService.search(this.searchObject).then((response) => {
              if (response && response.data) {
                this.searchHits.hits.push.apply(this.searchHits.hits, response.data.hits.hits);
              }
            }).finally(() => {
              gridApi.infiniteScroll.dataLoaded();
              this.loadingMore = false;
            });
          }
        });
        gridApi.core.on.sortChanged($scope, (grid, sortColumns) => {
          grid = grid;
          const sortColumn = _.first(sortColumns);
          if (sortColumn) {
            this.sortOrderChanged({
              field: sortColumn.field || '',
              order: sortColumn.sort && sortColumn.sort.direction || 'asc',
            });
            return;
          }
          this.sortOrderChanged({ field: '', order: '' });
        });
      },
      columnDefs: [{
        field: 'photos',
        displayName: '',
        cellTemplate: this.getTemplate('_imageTpl'),
        sortable: false,
        width: 70,
      }, {
        field: 'displayName',
        displayName: this.$translate.instant('spacesPage.nameHeader'),
        sort: {
          direction: 'asc',
          priority: 1,
        },
        sortCellFiltered: true,
      }, {
        field: 'connectionStatus',
        displayName: this.$translate.instant('spacesPage.statusHeader'),
        cellTemplate: this.getTemplate('_statusTpl'),
        sortable: true,
        sort: {
          direction: 'asc',
          priority: 0,
        },
      }, {
        field: 'product',
        displayName: this.$translate.instant('spacesPage.typeHeader'),
        cellTemplate: this.getTemplate('_productTpl'),
      }],
    };
  }

  public $onInit(): void {
  }

  public $onChanges() {
  }

  public getResult() {
    return this.searchHits && this.searchHits.hits;
  }

  private getTemplate(name) {
    return this.$templateCache.get('modules/csdm/templates/' + name + '.html');
  }

  public expandDevice(device) {
    this.$http.get(device.url).then((res) => {
      const realDevice = (device.productFamily === 'Huron') ? this.CsdmConverter.convertHuronDevice(res.data) :
        this.CsdmConverter.convertCloudberryDevice(res.data);
      this.$state.go('device-overview', {
        currentDevice: realDevice,
        huronDeviceService: this.huronDeviceService,
      });
    });
  }
}
interface IGridApiWithInfiniteScroll extends IGridApi {
  infiniteScroll: any;
}

export class DeviceNewListComponent implements ng.IComponentOptions {
  public controller = DeviceNewList;
  public bindings = {
    searchHits: '<',
    searchObject: '<',
    sortOrderChanged: '&',
  };
  public controllerAs = 'lctrl';
  public templateUrl = 'modules/csdm/devicesRedux/newList.html';
}
