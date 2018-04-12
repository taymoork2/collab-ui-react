class WebexReportsCtrl {
  private _qbsParameters: any;
  private _reportType: string = 'webex';
  private _viewType: string = 'Partner';
  private loadContent: boolean = false;
  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
    private $state: ng.ui.IStateService,
    private $rootScope: ng.IRootScopeService,
    private $sce: ng.ISCEService,
    private Authinfo,
    private FeatureToggleService,
    private Notification,
    private QlikService,
  ) {
  }

  public $onInit(): void {
    this.FeatureToggleService.atlasPartnerWebexReportsGetStatus().then((isPartnerWebexEnabled: boolean): void => {
      if (!isPartnerWebexEnabled) {
        this.$log.log('webex report for partner webex disabled');
        this.$state.go('login');
      } else {
        this.loadContent = true;
        this.loadMetricsReport();
      }
    });
  }

  public isLoadContent(): boolean {
    return this.loadContent;
  }

  public loadMetricsReport(): void {
    this._qbsParameters = {
      org_id: this.Authinfo.getOrgId(),
      email: this.Authinfo.getPrimaryEmail(),
    };

    let qbsResponseData: any;
    const getWebexReportData: any = _.get(this.QlikService, 'getQBSInfo');

    if (!_.isFunction(getWebexReportData)) {
      return;
    }

    getWebexReportData(this._reportType, this._viewType, this._qbsParameters).then((data) => {
      this.$log.log(data);
      qbsResponseData = {
        appid: data.appName,
        QlikTicket: data.ticket,
        node: data.host,
        persistent: data.isPersistent,
        vID: data.vid,
      };
      if (_.isUndefined(qbsResponseData.vID)) {
        qbsResponseData.vID = '';
      }
      const getQlikMashupUrl: any = _.get(this.QlikService, 'getQlikMashupUrl');
      const qlikMashupUrl: string = getQlikMashupUrl(data.qlik_reverse_proxy, this._reportType, this._viewType);

      qbsResponseData.trustIframeUrl = this.$sce.trustAsResourceUrl(qlikMashupUrl);
      this.$rootScope.$broadcast('updateIframe', qlikMashupUrl, qbsResponseData);
    })
      .catch((error) => {
        this.$rootScope.$broadcast('unfreezeState', true);
        this.Notification.errorWithTrackingId(error, 'reportsPage.webexMetrics.errorRequest');
      });
  }
}

export class WebexReportsComponent implements ng.IComponentOptions {
  public template = require('./webexReports.tpl.html');
  public controller = WebexReportsCtrl;
}
