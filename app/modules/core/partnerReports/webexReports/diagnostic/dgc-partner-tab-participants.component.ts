import { Notification } from 'modules/core/notifications';
import { PartnerSearchService, Platforms } from './partner-search.service';
import { ICallType, IParticipant } from './partner-search.interfaces';

export interface IGridApiScope extends ng.IScope {
  gridApi?: uiGrid.IGridApi;
}

class ParticipantsController implements ng.IComponentController {
  public gridData: IParticipant[];
  public gridOptions = {};
  public conferenceID: string;
  public loading = true;
  public deviceLoaded = false;
  public reqTimes = 0;
  public platformCellTemplate: string;
  public usernameCellTemplate: string;

  /* @ngInject */
  public constructor(
    private $scope: IGridApiScope,
    private $stateParams: ng.ui.IStateParamsService,
    private $translate: ng.translate.ITranslateService,
    private $timeout: ng.ITimeoutService,
    private Notification: Notification,
    private PartnerSearchService: PartnerSearchService,
  ) {
    this.conferenceID = _.get(this.$stateParams, 'cid');
    this.platformCellTemplate = require('./platform-cell-template.html');
    this.usernameCellTemplate = require('./username-cell-template.html');
  }

  public $onInit(): void {
    this.getParticipants();
    this.setGridOptions();
  }

  private getParticipants(): void {
    this.PartnerSearchService.getParticipants(this.conferenceID)
      .then((res: IParticipant[]) => {
        this.gridData = this.getGridData(res);
        this.setGridOptions();
        this.detectAndUpdateDevice();
      })
      .catch((err) => {
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
      })
      .finally(() => {
        this.loading = false;
      });
  }

  private getGridData(participants: IParticipant[]): IParticipant[] {
    return _.map(participants, (participant: IParticipant) => {
      const device = this.PartnerSearchService.getDevice({ platform: participant.platform, browser: participant.browser, sessionType: participant.sessionType });
      if (participant.platform === Platforms.TP && !device.name) {
        device.name = this.$translate.instant('reportsPage.webexMetrics.CMR3DefaultDevice');
      }
      return _.assignIn({}, participant, {
        phoneNumber: this.PartnerSearchService.getPhoneNumber(participant.phoneNumber),
        callInNumber: this.PartnerSearchService.getPhoneNumber(participant.callInNumber),
        platform_: _.get(device, 'name'),
        duration: this.PartnerSearchService.getDuration(participant.duration),
        endReason: this.PartnerSearchService.getParticipantEndReason(participant.reason),
        startDate: this.PartnerSearchService.timestampToDate(participant.joinTime, 'YYYY-MM-DD hh:mm:ss'),
      });
    });
  }

  private detectAndUpdateDevice(): void {
    this.deviceLoaded = true;
    this.gridData.forEach((item: ICallType) => {
      if (item.platform === Platforms.TP && !item.deviceCompleted) {
        this.deviceLoaded = false;
        this.PartnerSearchService.getRealDevice(item.conferenceID, item.nodeId)
          .then((res: ICallType) => {
            if (res.completed) {
              item.device = this.updateDevice(res);
            }
            item.deviceCompleted = res.completed;
          });
      }
    });

    if (!this.deviceLoaded && this.reqTimes < 5) {
      this.$timeout(() => {
        this.reqTimes += 1;
        this.detectAndUpdateDevice();
      }, 3000);
    }
  }

  private updateDevice(deviceInfo: ICallType): string {
    if (!_.isEmpty(deviceInfo.items)) {
      const device = deviceInfo.items[0].deviceType;
      return device;
    }
    return this.$translate.instant('reportsPage.webexMetrics.CMR3DefaultDevice');
  }

  private setGridOptions(): void {
    const columnDefs = [{
      width: '16%',
      cellTooltip: true,
      field: 'userName',
      displayName: this.$translate.instant('webexReports.participantsTable.userName'),
      cellTemplate: this.usernameCellTemplate,
    }, {
      width: '16%',
      field: 'startDate',
      displayName: this.$translate.instant('webexReports.participantsTable.startDate'),
    }, {
      width: '10%',
      field: 'duration',
      displayName: this.$translate.instant('webexReports.participantsTable.duration'),
    }, {
      width: '20%',
      field: 'platform_',
      cellTooltip: true,
      displayName: this.$translate.instant('webexReports.participantsTable.endpoint'),
      cellTemplate: this.platformCellTemplate,
    }, {
      field: 'clientIP',
      cellTooltip: true,
      displayName: this.$translate.instant('webexReports.participantsTable.clientIP'),
    }, {
      field: 'gatewayIP',
      cellTooltip: true,
      displayName: this.$translate.instant('webexReports.participantsTable.gatewayIP'),
    }, {
      field: 'endReason',
      cellTooltip: true,
      displayName: this.$translate.instant('webexReports.participantsTable.endReason'),
    }];

    this.gridOptions = {
      rowHeight: 64,
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

export class DgcPartnerTabParticipantsComponent implements ng.IComponentOptions {
  public controller = ParticipantsController;
  public template = require('modules/core/partnerReports/webexReports/diagnostic/dgc-partner-tab-participants.html');
}
