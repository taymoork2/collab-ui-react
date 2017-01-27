import { Notification } from 'modules/core/notifications';

export abstract class ExpresswayContainerController {

  public backState = 'services-overview';
  public userStatusesSummary = [];
  protected subscribeStatusesSummary: any;

  /* @ngInject */
  constructor(private $modal,
              private $state: ng.ui.IStateService,
              private Notification: Notification,
              protected ServiceDescriptor,
              protected USSService,
              protected servicesId: string[],
              private connectorType: string, ) {
    this.firstTimeSetup();
    this.extractSummary();
    this.subscribeStatusesSummary = this.USSService.subscribeStatusesSummary('data', this.extractSummary.bind(this));
  }

  public extractSummary(): void {
    this.userStatusesSummary = this.USSService.extractSummaryForAService(this.servicesId);
  }

  protected firstTimeSetup(): void {
    this.ServiceDescriptor.isServiceEnabled(this.servicesId[0], (error, enabled) => {
      if (error) {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        return;
      }
      if (enabled) {
        return;
      }
      this.$modal.open({
        resolve: {
          connectorType: () => this.connectorType,
          serviceId: () => this.servicesId[0],
          firstTimeSetup: true,
        },
        controller: 'AddResourceController',
        controllerAs: 'vm',
        templateUrl: 'modules/hercules/service-specific-pages/common-expressway-based/add-resource-modal.html',
        type: 'small',
      })
        .result
        .catch(() => {
          this.$state.go('services-overview');
        });

    });
  }

}
