import { Analytics } from 'modules/core/analytics';
import { FeatureToggleService } from 'modules/core/featureToggle';
import { Notification } from 'modules/core/notifications';
import { SearchService, Platforms, TrackingEventName } from './searchService';
import './_search.scss';

export interface IGridApiScope extends ng.IScope {
  gridApi?: uiGrid.IGridApi;
}

class Participants implements ng.IComponentController {

  public gridData: any;
  public gridOptions = {};
  public conferenceID: string;
  public loading: boolean = true;
  public deviceLoaded = false;
  public reqtimes = 0;
  public platformCellTemplate: string;
  public usernameCellTemplate: string;

  /* @ngInject */
  public constructor(
    private $scope: IGridApiScope,
    private $stateParams: ng.ui.IStateParamsService,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private Analytics: Analytics,
    private FeatureToggleService: FeatureToggleService,
    private Notification: Notification,
    private SearchService: SearchService,
  ) {
    this.conferenceID = _.get(this.$stateParams, 'cid');
    this.platformCellTemplate = require('modules/core/customerReports/webexReports/diagnostic/platform-cell-template.html');
    this.usernameCellTemplate = require('modules/core/customerReports/webexReports/diagnostic/username-cell-template.html');
  }

  public $onInit() {
    this.Analytics.trackEvent(TrackingEventName.MEETING_PARTICIPANTS);
    this.FeatureToggleService.supports(this.FeatureToggleService.features.diagnosticF8105ClientVersion)
      .then((isSupport: boolean) => {
        this.getParticipants(isSupport);
      });
    this.setGridOptions();
  }

  private getParticipants(isSupportClientVersion: boolean): void {
    this.SearchService.getParticipants(this.conferenceID)
      .then((res) => {
        this.gridData = _.map(res, (item: any) => {
          const device = this.SearchService.getDevice({ platform: item.platform, browser: item.browser, sessionType: item.sessionType });
          if (item.platform === Platforms.TP && !device.name) {
            device.name = this.$translate.instant('reportsPage.webexMetrics.CMR3DefaultDevice');
          }
          let deviceName = _.get(device, 'name');
          if (!(item.platform === Platforms.TP || item.sessionType === Platforms.PSTN) && isSupportClientVersion) {
            const devicePlatform = _.get(device, 'platform');
            const deviceBrowser = _.get(device, 'browser');
            if (devicePlatform && deviceBrowser) {
              const clientVersion = this.SearchService.getClientVersion(`${item.userId}_${item.userName}`);
              deviceName = `${devicePlatform} ${clientVersion.osVersion}: ${deviceBrowser} ${clientVersion.browserVersion}`;
            }
          }
          return _.assignIn({}, item, {
            phoneNumber: this.SearchService.getPhoneNumber(item.phoneNumber),
            callInNumber: this.SearchService.getPhoneNumber(item.callInNumber),
            platform_: deviceName,
            duration: this.SearchService.getDuration(item.duration),
            endReason: this.SearchService.getParticipantEndReson(item.reason),
            startDate: this.SearchService.timestampToDate(item.joinTime, 'YYYY-MM-DD hh:mm:ss'),
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

  private detectAndUpdateDevice() {
    this.deviceLoaded = true;
    this.gridData.forEach((item) => {
      if (item.platform === Platforms.TP && !item.deviceCompleted) {
        this.deviceLoaded = false;
        this.SearchService.getRealDevice(item.conferenceID, item.nodeId)
        .then((res: any) => {
          if (res.completed) {
            item.device = this.updateDevice(res);
          }
          item.deviceCompleted = res.completed;
        });
      }
    });

    if (!this.deviceLoaded && this.reqtimes < 5) {
      this.$timeout(() => {
        this.reqtimes += 1;
        this.detectAndUpdateDevice();
      }, 3000);
    }
  }

  private updateDevice(deviceInfo) {
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
  public template = require('modules/core/customerReports/webexReports/diagnostic/tabParticipants.html');
}
