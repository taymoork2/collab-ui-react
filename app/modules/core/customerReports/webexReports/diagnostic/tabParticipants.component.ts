import './_search.scss';
import { SearchService } from './searchService';
import { Notification } from 'modules/core/notifications';

export interface IGridApiScope extends ng.IScope {
  gridApi?: uiGrid.IGridApi;
}

class Participants implements ng.IComponentController {

  public gridData: any;
  public gridOptions = {};
  public conferenceID: string;
  public loading: boolean = true;

  /* @ngInject */
  public constructor(
    private $scope: IGridApiScope,
    private Notification: Notification,
    private SearchService: SearchService,
    private $stateParams: ng.ui.IStateParamsService,
  ) {
    this.conferenceID = _.get(this.$stateParams, 'cid');
  }

  public $onInit() {
    this.getParticipants();
    this.setGridOptions();
  }

  private getParticipants() {
    this.SearchService.getParticipants(this.conferenceID)
      .then((res) => {
        _.forEach(res, (item) => {
          const browser = this.SearchService.getBrowser(item.browser);
          const platform = this.SearchService.getPlartform({ platform: item.platform, sessionType: item.sessionType });
          item.Duration = moment.duration(item.duration * 1000).humanize();
          item.endReason = this.SearchService.getParticipantEndReson(item.reason);
          item.startDate = this.SearchService.timestampToDate(item.joinTime, 'MMMM Do, YYYY h:mm:ss A');
          item.platform_ = browser ? `${browser} on ${platform}` : platform;
        });
        this.gridData = res;
        this.loading = false;
        this.setGridOptions();
      })
      .catch((err) => {
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
        this.loading = true;
      });
  }

  private setGridOptions(): void { // TODO , will translate next time
    const columnDefs = [{
      sortable: true,
      cellTooltip: true,
      field: 'userName',
      displayName: 'User Name',
    }, {
      field: 'startDate',
      displayName: 'Start Date',
    }, {
      field: 'Duration',
      displayName: 'Duration',
    }, {
      field: 'platform_',
      cellTooltip: true,
      displayName: 'Endpoint',
    }, {
      field: 'clientIP',
      cellTooltip: true,
      displayName: 'Client IP',
    }, {
      field: 'gatewayIP',
      cellTooltip: true,
      displayName: 'Gateway IP',
    }, {
      field: 'endReason',
      cellTooltip: true,
      displayName: 'End Reason',
    }];

    this.gridOptions = {
      rowHeight: 44,
      data: '$ctrl.gridData',
      multiSelect: false,
      columnDefs: columnDefs,
      enableColumnMenus: false,
      enableColumnResizing: true,
      enableRowHeaderSelection: false,
      onRegisterApi: (gridApi) => {
        this.$scope.gridApi = gridApi;
      },
    };
  }
}

export class ParticipantsComponent implements ng.IComponentOptions {
  public controller = Participants;
  public template = require('modules/core/customerReports/webexReports/diagnostic/tabParticipants.html');
}
