import { IExtendedStatusSummary, USSService } from 'modules/hercules/services/uss.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { IToolkitModalService } from 'modules/core/modal';

export class CallServiceUsersPageController implements ng.IComponentController {
  public exportUserStatusSection = {
    title: 'hercules.userStatuses.reportTitle',
    subsectionLabel: 'hercules.userStatuses.reportTitle',
    subsectionDescription: 'hercules.userStatuses.description',
  };
  public userStatusesSummary: IExtendedStatusSummary[] = [];
  private subscribeStatusesSummary: any;
  private servicesId: HybridServiceId[] = ['squared-fusion-uc', 'squared-fusion-ec'];

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private Analytics,
    private USSService: USSService,
  ) {}

  public $onInit() {
    this.Analytics.trackHybridServiceEvent(this.Analytics.sections.HS_NAVIGATION.eventNames.VISIT_CAL_EXC_USER_LIST);
    this.extractSummary();
    this.subscribeStatusesSummary = this.USSService.subscribeStatusesSummary('data', this.extractSummary.bind(this));
  }

  public extractSummary() {
    this.userStatusesSummary = this.USSService.extractSummaryForAService(this.servicesId);
  }

  public $onDestroy() {
    this.subscribeStatusesSummary.cancel();
  }

  public openReportModal(): ng.ui.bootstrap.IModalServiceInstance {
    return this.$modal.open({
      controller: 'ExportUserStatusesController',
      controllerAs: 'exportUserStatusesCtrl',
      template: require('modules/hercules/service-specific-pages/components/user-status-report/export-user-statuses.html'),
      type: 'small',
      resolve: {
        servicesId: () => this.servicesId,
        userStatusSummary: () => this.userStatusesSummary,
      },
    });
  }
}

export class CallServiceUsersPageComponent implements ng.IComponentOptions {
  public controller = CallServiceUsersPageController;
  public template = require('./call-service-users-page.html');
  public bindings = {};
}
