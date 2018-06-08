import { ICallType, IParticipant } from './partner-search.interfaces';
import { Platforms, SearchStorage } from './partner-meeting.enum';
import { Notification } from 'modules/core/notifications';
import { CustomerSearchService } from './customer-search.service';
import { PartnerSearchService } from './partner-search.service';
import { WebexReportsUtilService } from './webex-reports-util.service';

interface IGridApiScope extends ng.IScope {
  gridApi?: uiGrid.IGridApi;
}

class DgcPartnerTabParticipantsController implements ng.IComponentController {
  public gridData: IParticipant[];
  public gridOptions: uiGrid.IGridOptions = {};
  public conferenceID: string;
  public loading = true;
  public deviceLoaded = false;
  public reqTimes = 0;
  public platformCellTemplate: string;
  public usernameCellTemplate: string;
  private isSupportClientVersion = false;
  private dataService: (PartnerSearchService | CustomerSearchService);

  /* @ngInject */
  public constructor(
    private $scope: IGridApiScope,
    private $stateParams: ng.ui.IStateParamsService,
    private $translate: ng.translate.ITranslateService,
    private $timeout: ng.ITimeoutService,
    private Notification: Notification,
    private CustomerSearchService: CustomerSearchService,
    private FeatureToggleService,
    private PartnerSearchService: PartnerSearchService,
    private WebexReportsUtilService: WebexReportsUtilService,
  ) {
    this.conferenceID = _.get(this.$stateParams, 'cid');
    this.platformCellTemplate = require('./platform-cell-template.html');
    this.usernameCellTemplate = require('./username-cell-template.html');

    const isPartnerRole = this.WebexReportsUtilService.getStorage(SearchStorage.PARTNER_ROLE);
    this.dataService = (isPartnerRole) ? this.PartnerSearchService : this.CustomerSearchService;
  }

  public $onInit(): void {
    this.FeatureToggleService.diagnosticPartnerF8105ClientVersionGetStatus()
      .then((isSupport: boolean) => {
        this.isSupportClientVersion = isSupport;
        this.getParticipants();
      });
  }

  private getParticipants(): void {
    this.dataService.getParticipants(this.conferenceID)
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
      const device = this.WebexReportsUtilService.getDevice({ platform: participant.platform, browser: participant.browser, sessionType: participant.sessionType });
      if (participant.platform === Platforms.TP && !device.name) {
        device.name = this.$translate.instant('reportsPage.webexMetrics.CMR3DefaultDevice');
      }

      const deviceName = this.getDeviceName(participant, device);
      return _.assignIn({}, participant, {
        phoneNumber: this.WebexReportsUtilService.getPhoneNumber(participant.phoneNumber),
        callInNumber: this.WebexReportsUtilService.getPhoneNumber(participant.callInNumber),
        platform_: deviceName,
        duration: this.WebexReportsUtilService.getDuration(participant.duration),
        endReason: this.WebexReportsUtilService.getParticipantEndReason(participant.reason),
        startDate: this.WebexReportsUtilService.timestampToDate(participant.joinTime, 'YYYY-MM-DD hh:mm:ss'),
      });
    });
  }

  private getDeviceName(participant: IParticipant, device: { name: string, icon: string }): string {
    let deviceName: string = _.get(device, 'name');
    if (!(participant.platform === Platforms.TP || participant.sessionType === Platforms.PSTN) && this.isSupportClientVersion) {
      const devicePlatform = this.WebexReportsUtilService.getPlatform(_.get(participant, 'platform'));
      const deviceBrowser = this.WebexReportsUtilService.getBrowser(_.get(participant, 'browser'));
      if (devicePlatform && deviceBrowser) {
        const clientVersion = this.WebexReportsUtilService.getClientVersion(`${ participant.userId }_${ participant.userName }`);
        deviceName = `${ devicePlatform } ${ clientVersion.osVersion }: ${ deviceBrowser } ${ clientVersion.browserVersion }`;
      }
    }
    return deviceName;
  }

  private detectAndUpdateDevice(): void {
    this.deviceLoaded = true;
    this.gridData.forEach((item: ICallType) => {
      if (item.platform === Platforms.TP && !item.deviceCompleted) {
        this.deviceLoaded = false;
        this.dataService.getRealDevice(item.conferenceID, item.nodeId)
          .then((res: ICallType) => {
            if (res.completed) {
              item.device = this.getDeviceType(res);
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

  private getDeviceType(deviceInfo: ICallType): string {
    if (!_.isEmpty(deviceInfo.items)) {
      return deviceInfo.items[0].deviceType;
    }
    return this.$translate.instant('reportsPage.webexMetrics.CMR3DefaultDevice');
  }

  private setGridOptions(): void {
    const columnDefs: uiGrid.IColumnDef[] = [{
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
  public controller = DgcPartnerTabParticipantsController;
  public template = require('./dgc-partner-tab-participants.html');
}
