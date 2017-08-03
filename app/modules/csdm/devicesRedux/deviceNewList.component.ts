import { CsdmSearchService, SearchObject } from '../services/csdmSearch.service';
class DeviceNewList implements ng.IComponentController {
  public searchObject: SearchObject;
  public devices;
  private huronDeviceService: any;
  public gridOptions;
  public gridApi: uiGrid.IGridApi;
  /* @ngInject */
  constructor(private $state,
              private $q: ng.IQService,
              private $http,
              private CsdmSearchService: CsdmSearchService,
              private CsdmConverter,
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
      showGridFooter: true,
      gridFooterTemplate: this.getTemplate('_footerTpl'),
      enableHorizontalScrollbar: 0,
      rowHeight: 45,
      enableRowHeaderSelection: false,
      enableColumnMenus: false,
      multiSelect: false,
      onRegisterApi: (gridApi) => {
        this.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged(this.$scope, (row) => {
          this.expandDevice(row.entity);
        });
        gridApi.infiniteScroll.on.needLoadMoreData(this.$scope, () => {
          const promise = this.$q.defer();
          if (!this.searchObject) {
            this.searchObject = SearchObject.create('');
          }
          this.searchObject.nextPage();
          this.CsdmSearchService.search(this.searchObject).then((response) => {
            if (response && response.data) {
              this.devices.push.apply(this.devices, response.data.hits.hits);
              promise.resolve();
            }
          }).catch(() => {
              promise.reject();
            }).finally(() => {
              gridApi.infiniteScroll.dataLoaded();
            });
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
    return this.devices;
  }

  private getTemplate(name) {
    return this.$templateCache.get('modules/squared/devices/templates/' + name + '.html');
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

export class DeviceNewListComponent implements ng.IComponentOptions {
  public controller = DeviceNewList;
  public bindings = {
    devices: '<',
    searchObject: '<',
  };
  public controllerAs = 'lctrl';
  public templateUrl = 'modules/csdm/devicesRedux/newList.html';
}
