import { ICmcOrgStatusResponse, ICmcUserStatusInfoResponse, ICmcUserStatus } from './../cmc.interface';

class CmcDetailsStatusComponentCtrl implements ng.IComponentController {

  public orgId;
  public status: ICmcOrgStatusResponse;
  public error: any;
  public userStatuses: Array<ICmcUserStatus>;
  public gridOptions;
  public userStatusesSummaryText: string;

  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
    private Authinfo,
    private CmcService,
    private CmcUserService,
  ) {
    this.orgId = this.Authinfo.getOrgId();
  }

  public $onInit() {
    this.$log.debug('$onInit');
    this.$log.debug('Authinfo.orgid:', this.Authinfo.getOrgId());
    this.$log.debug('Authinfo.orgname:', this.Authinfo.getOrgName());

    this.initGrid();

    this.CmcService.preCheckOrg(this.Authinfo.getOrgId())
      .then((res: ICmcOrgStatusResponse) => {
        this.$log.info('Result from preCheckOrg:', res);
        this.status = res;
      })
      .catch((error) => {
        this.$log.info('Error Result from preCheckOrg:', error);
        this.error = error.data;
      });

    this.fetchUserStatuses(100).then( () => {
      this.CmcUserService.insertUserDisplayNames(this.userStatuses);
    });
  }

  private fetchUserStatuses(limit: number) {
    return this.CmcUserService.getUsersWithCmcButMissingAware(limit)
      .then( (result: ICmcUserStatusInfoResponse) => {
        this.userStatuses = result.userStatuses;
        if (result.paging) {
          this.userStatusesSummaryText = 'Listing the first ' + this.userStatuses.length + ' active users.';
        } else {
          this.userStatusesSummaryText = 'Listing all ' + this.userStatuses.length + ' active users.';
        }
      });
  }

  private initGrid() {
    let columnDefs = [{
      width: '25%',
      sortable: true,
      field: 'displayName',
      displayName: 'User Name',
    }, {
      width: '30%',
      sortable: true,
      field: 'state',
      displayName: 'Service Status',
      sort: { direction: 'asc', priority: 0 },
    }, {
      width: '25%',
      sortable: false,
      field: 'userId',
      displayName: 'Id',
    }, {
      width: '20%',
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
