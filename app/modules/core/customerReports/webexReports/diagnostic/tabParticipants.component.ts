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
    private $state: ng.ui.IStateService,
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
          item.Duration = moment.duration(item.duration * 1000).humanize();
          item.endReason = this.SearchService.getParticipantEndReson(item.reason);
          item.startDate = this.SearchService.timestampToDate(item.joinTime, 'YYYY.MM.DD HH:mm:ss');
          item.platform_ = this.SearchService.getPlartform({ platform: item.platform, sessionType: item.sessionType });
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

  public showDetail(item) {
    this.SearchService.setStorage('aaa', item); // TODO, Will do next sprint
    this.$state.go('dgc-panel');
  }

  private setGridOptions(): void {
    const columnDefs = [{
      sortable: true,
      cellTooltip: true,
      field: 'userName',
      displayName: 'User Name',
    }, {
      sortable: true,
      field: 'callerID',
      cellClass: 'text-right',
      displayName: 'Caller ID',
    }, {
      field: 'startDate',
      displayName: 'Start Date',
    }, {
      field: 'Duration',
      displayName: 'Duration',
    }, {
      field: 'platform_',
      cellTooltip: true,
      displayName: 'Platform',
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
        gridApi.selection.on.rowSelectionChanged(this.$scope, (row) => {
          this.showDetail(row.entity);
        });
      },
    };
  }
}

export class ParticipantsComponent implements ng.IComponentOptions {
  public controller = Participants;
  public template = require('modules/core/customerReports/webexReports/diagnostic/tabParticipants.html');
}
