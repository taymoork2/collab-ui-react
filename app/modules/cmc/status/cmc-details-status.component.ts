import { ICmcOrgStatusResponse, ICmcUserStatusInfoResponse, ICmcUserStatus } from './../cmc.interface';
import { Notification } from 'modules/core/notifications';

class CmcDetailsStatusComponentCtrl implements ng.IComponentController {

  public orgId;
  public orgName;
  public status: ICmcOrgStatusResponse;
  public userStatuses: ICmcUserStatus[];
  public fetchedUserStatuses: ICmcUserStatus[];
  public gridOptions;
  public userStatusesSummaryText: string;
  private statTemplate;
  public filters: any[];
  private searchStr: string;
  private nextUrl: string;
  public gridApi;

  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
    private Authinfo,
    private CmcService,
    private CmcUserService,
    private $translate,
    private Notification: Notification,
    private $templateCache,
    private $filter: ng.IFilterService,
    private $scope: ng.IScope,
    private $window,
  ) {
    this.orgId = this.Authinfo.getOrgId();
    this.orgName = this.Authinfo.getOrgName();
    this.statTemplate = this.$templateCache.get('modules/cmc/status/statColumn.tpl.html');

    // TODO Add this and also  errors when CMC provides more info
    // this.filters = [{
    //   name: 'Activated',
    //   filterValue: 'activated',
    //   count: 0,
    // } ];
  }

  public filterList(searchStr: string) {
    this.$log.debug('searchStr', searchStr );
    this.searchStr = searchStr;
    this.$log.debug('user statuses', this.fetchedUserStatuses);
    this.userStatuses = this.$filter('filter')(this.fetchedUserStatuses, { displayName: this.searchStr });
  }

  public updateGridAtResize = () => {
    this.gridApi.core.handleWindowResize();
  }

  public $onDestroy() {
    angular.element(this.$window).off('resize');
  }

  public $onInit() {

    this.initGrid();

    angular.element(this.$window).on('resize', _.debounce(this.updateGridAtResize, 100));

    this.CmcService.preCheckOrg(this.Authinfo.getOrgId())
      .then((res: ICmcOrgStatusResponse) => {
        this.$log.info('Result from preCheckOrg:', res);
        this.status = res;
      })
      .catch((error: any) => {
        this.$log.info('Error Result from preCheckOrg:', error);
        let msg: string = 'unknown';
        if (error.data && error.data.message) {
          msg = error.data.message;
        }
        this.Notification.error('cmc.failures.preCheckFailure', { msg: msg });
      });

    this.fetchUserStatuses(100).then( () => {
      this.CmcUserService.insertUserDisplayNames(this.userStatuses);
      this.updateGridAtResize();
    });
  }

  private fetchUserStatuses(limit: number) {
    return this.CmcUserService.getUsersWithCmcButMissingAware(limit)
      .then( (result: ICmcUserStatusInfoResponse) => {
        this.userStatuses = result.userStatuses;
        this.fetchedUserStatuses = result.userStatuses;
        if (result.paging.next) {
          this.nextUrl = result.paging.next;
          this.$log.debug('nextUrl', this.nextUrl);
          this.userStatusesSummaryText = this.$translate.instant('cmc.statusPage.listingFirstActiveUsers', { noOfActiveUsers: this.userStatuses.length });
        } else {
          this.userStatusesSummaryText = '';
        }
      })
      .catch((error: any) => {
        this.$log.info('Error Result from user status request:', error);
        let msg: string = 'unknown';
        if (error.data && error.data.message) {
          msg = error.data.message;
        }
        this.Notification.error('cmc.failures.userStatusFailure', { msg: msg });
      });
  }

  private initGrid() {
    const columnDefs = [{
      width: '35%',
      sortable: true,
      field: 'displayName',
      displayName: this.$translate.instant('cmc.statusPage.table.username'),
    }, {
      width: '30%',
      sortable: true,
      field: 'state',
      displayName: 'Service Status',
      cellTemplate: this.statTemplate,
      cellClass: 'ui-grid-cell-contents',
      sort: { direction: 'asc', priority: 0 },
    }, {
      width: '35%',
      sortable: true,
      field: 'lastStatusUpdate',
      displayName: this.$translate.instant('cmc.statusPage.table.lastUpdated'),
    }];

    this.gridOptions = {
      rowHeight: 37,
      data: '$ctrl.userStatuses',
      onRegisterApi: (gridApi) => {
        this.onRegisterApi(gridApi);
      },
      multiSelect: false,
      columnDefs: columnDefs,
      enableColumnMenus: false,
      enableColumnResizing: true,
      enableRowHeaderSelection: false,
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: 2,
    };
  }

  // This is base for paging
  private onRegisterApi(gridApi): void {
    gridApi.infiniteScroll.on.needLoadMoreData(this.$scope, () => {
      this.$log.debug('needLoadMoreData');
    });
    gridApi.infiniteScroll.on.needLoadMoreDataTop(this.$scope, () => {
      this.$log.debug('needLoadMoreDataTop');
    });
    this.gridApi = gridApi;
    this.$log.debug('gridApi', gridApi);
  }
}

export class CmcDetailsStatusComponent implements ng.IComponentOptions {
  public controller = CmcDetailsStatusComponentCtrl;
  public templateUrl = 'modules/cmc/status/status.component.html';
  public bindings = {
  };
}
