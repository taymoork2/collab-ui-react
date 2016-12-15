class GoogleCalendarSettingsCtrl implements ng.IComponentController {
  public pageTitle = this.$translate.instant('hercules.hybridServiceNames.squared-fusion-gcal');
  public backState = 'services-overview';
  public userStatusesSummary = [];
  private subscribeStatusesSummary: any;

  private serviceId = 'squared-fusion-gcal';

  /* @ngInject */
  constructor(
    private $modal,
    private $translate: ng.translate.ITranslateService,
    private USSService,
  ) {}

  public $onInit() {
    this.subscribeStatusesSummary = this.USSService.subscribeStatusesSummary('data', this.extractSummary.bind(this));
  }

  public $onDestroy() {
    this.subscribeStatusesSummary.cancel();
  }

  public extractSummary() {
    this.userStatusesSummary = this.USSService.extractSummaryForAService([this.serviceId]);
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
