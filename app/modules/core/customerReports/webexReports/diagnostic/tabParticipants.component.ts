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
          const device = this.SearchService.getDevice({ platform: item.platform, browser: item.browser, sessionType: item.sessionType });
          item.Duration = this.SearchService.getDuration(item.duration);
          item.endReason = this.SearchService.getParticipantEndReson(item.reason);
          item.startDate = this.SearchService.timestampToDate(item.joinTime, 'YYYY-MM-DD hh:mm:ss');
          item.platform_ = device.name;
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
      width: '14%',
      cellTooltip: true,
      field: 'userName',
      displayName: 'User Name',
    }, {
      width: '16%',
      field: 'startDate',
      displayName: 'Start Date',
    }, {
      width: '10%',
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
