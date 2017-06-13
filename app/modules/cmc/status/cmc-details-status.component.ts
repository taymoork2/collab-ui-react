import { ICmcOrgStatusResponse, ICmcUserStatusInfoResponse, ICmcUserStatus } from './../cmc.interface';
import { Notification } from 'modules/core/notifications';

class CmcDetailsStatusComponentCtrl implements ng.IComponentController {

  public orgId;
  public orgName;
  public status: ICmcOrgStatusResponse;
  public userStatuses: Array<ICmcUserStatus>;
  public gridOptions;
  public userStatusesSummaryText: string;
  private statTemplate;

  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
    private Authinfo,
    private CmcService,
    private CmcUserService,
    private $translate,
    private Notification: Notification,
    private $templateCache,
  ) {
    this.orgId = this.Authinfo.getOrgId();
    this.orgName = this.Authinfo.getOrgName();


    this.statTemplate = this.$templateCache.get('modules/cmc/status/statColumn.tpl.html');

  }

  public $onInit() {

    this.initGrid();
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
    });
  }

  private fetchUserStatuses(limit: number) {
    return this.CmcUserService.getUsersWithCmcButMissingAware(limit)
      .then( (result: ICmcUserStatusInfoResponse) => {
        this.userStatuses = result.userStatuses;
        if (result.paging.next) {
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
    let columnDefs = [{
      width: '35%',
      sortable: true,
      field: 'displayName',
      displayName: 'User Name',
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
      displayName: 'Last Updated',
    }];

    this.gridOptions = {
      rowHeight: 37,
      data: '$ctrl.userStatuses',
      multiSelect: false,
      columnDefs: columnDefs,
      enableColumnMenus: false,
      enableColumnResizing: true,
      enableRowHeaderSelection: false,
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: 2,
    };
  }
}

export class CmcDetailsStatusComponent implements ng.IComponentOptions {
  public controller = CmcDetailsStatusComponentCtrl;
  public templateUrl = 'modules/cmc/status/status.component.html';
  public bindings = {
  };
}
