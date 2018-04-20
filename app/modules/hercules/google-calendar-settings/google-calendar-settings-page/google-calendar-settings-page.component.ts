import { IExtendedStatusSummary, USSService } from 'modules/hercules/services/uss.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { IToolkitModalService } from 'modules/core/modal';

class GoogleCalendarSettingsCtrl implements ng.IComponentController {
  public backState = 'services-overview';
  public userStatusesSummary: IExtendedStatusSummary[] = [];
  private subscribeStatusesSummary: any;

  private serviceId: HybridServiceId = 'squared-fusion-gcal';

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private USSService: USSService,
  ) {}

  public $onInit() {
    this.extractSummary();
    this.subscribeStatusesSummary = this.USSService.subscribeStatusesSummary('data', this.extractSummary.bind(this));
  }

  public $onDestroy() {
    this.subscribeStatusesSummary.cancel();
  }

  public extractSummary() {
    this.userStatusesSummary = this.USSService.extractSummaryForAService([this.serviceId]);
  }

  public openUserStatusReportModal(): ng.ui.bootstrap.IModalServiceInstance {
    return this.$modal.open({
      controller: 'ExportUserStatusesController',
      controllerAs: 'exportUserStatusesCtrl',
      template: require('modules/hercules/service-specific-pages/components/user-status-report/export-user-statuses.html'),
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
  public template = require('modules/hercules/google-calendar-settings/google-calendar-settings-page/google-calendar-settings-page.html');
}
