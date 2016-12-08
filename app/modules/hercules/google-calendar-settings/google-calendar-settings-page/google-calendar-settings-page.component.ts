class GoogleCalendarSettingsCtrl implements ng.IComponentController {
  public pageTitle = this.$translate.instant('Hybrid Calendar (Google)');
  public backState = 'services-overview';
  public userStatusesSummary = [];

  private serviceId = 'squared-fusion-gcal';

  /* @ngInject */
  constructor(
    private $modal,
    private $translate: ng.translate.ITranslateService,
    private USSService,
  ) {}

  public $onInit() {
    const dataFromService = this.USSService.extractSummaryForAService(this.serviceId);
    // Add random data while the backend is not ready
    this.userStatusesSummary = dataFromService.length > 0 ? dataFromService : [{
      serviceId: this.serviceId,
      activated: _.random(0, 100),
      notActivated: _.random(0, 100),
      error: _.random(0, 100),
      total: _.random(0, 100),
    }];
  }

  public openUserStatusReportModal(): void {
    return this.$modal.open({
      controller: 'ExportUserStatusesController',
      controllerAs: 'exportUserStatusesCtrl',
      templateUrl: 'modules/hercules/user-statuses/export-user-statuses.html',
      type: 'small',
      resolve: {
        servicesId: () => [this.serviceId],
        userStatusSummary: () => this.userStatusesSummary,
      },
    });
  }
}

export class GoogleCalendarSettingsPageComponent implements ng.IComponentOptions {
  public controller = GoogleCalendarSettingsCtrl;
  public templateUrl = 'modules/hercules/google-calendar-settings/google-calendar-settings-page/google-calendar-settings-page.html';
}
