import { Notification } from 'modules/core/notifications';
import { PartnerSearchService, Platforms } from './partner-search.service';
import { IDevice, IParticipant } from './partner-search.interfaces';

export interface IGridApiScope extends ng.IScope {
  gridApi?: uiGrid.IGridApi;
}

class Participants implements ng.IComponentController {

  public gridData: any; //TODO use base type
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
        this.gridData = _.map(res, (item: IParticipant) => {
          const device = this.PartnerSearchService.getDevice({ platform: item.platform, browser: item.browser, sessionType: item.sessionType });
          if (item.platform === Platforms.TP && !device.name) {
            device.name = this.$translate.instant('reportsPage.webexMetrics.CMR3DefaultDevice');
          }
          return _.assignIn({}, item, {
            phoneNumber: this.PartnerSearchService.getPhoneNumber(item.phoneNumber),
            callInNumber: this.PartnerSearchService.getPhoneNumber(item.callInNumber),
            platform_: _.get(device, 'name'),
            duration: this.PartnerSearchService.getDuration(item.duration),
            endReason: this.PartnerSearchService.getParticipantEndReason(item.reason),
            startDate: this.PartnerSearchService.timestampToDate(item.joinTime, 'YYYY-MM-DD hh:mm:ss'),
          });
        });
        this.loading = false;
        this.setGridOptions();

        this.detectAndUpdateDevice();
      })
      .catch((err) => {
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
        this.loading = true;
      });
  }

  private detectAndUpdateDevice(): void {
    this.deviceLoaded = true;
    this.gridData.forEach((item: IDevice) => {
      if (item.platform === Platforms.TP && !item.deviceCompleted) {
        this.deviceLoaded = false;
        this.PartnerSearchService.getRealDevice(item.conferenceID, item.nodeId)
        .then((res: any) => {
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

  private updateDevice(deviceInfo: IDevice): string {
    if (deviceInfo.items && deviceInfo.items.length > 0) {
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

export class ParticipantsComponent implements ng.IComponentOptions {
  public controller = Participants;
  public template = require('modules/core/partnerReports/webexReports/diagnostic/tab-participants.html');
}
