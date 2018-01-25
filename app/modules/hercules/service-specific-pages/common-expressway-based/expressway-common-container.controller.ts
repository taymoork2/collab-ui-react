import { Notification } from 'modules/core/notifications';
import { ConnectorType, HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';

export abstract class ExpresswayContainerController {

  public backState = 'services-overview';
  public userStatusesSummary = [];
  protected subscribeStatusesSummary: any;

  /* @ngInject */

  constructor(
    private $modal,
    private $state: ng.ui.IStateService,
    private $timeout: ng.ITimeoutService,
    protected Notification: Notification,
    protected ServiceDescriptorService: ServiceDescriptorService,
    private ServiceStateChecker,
    protected USSService,
    protected servicesId: HybridServiceId[],
    private connectorType: ConnectorType,
  ) {
    this.firstTimeSetup();
    this.extractSummary();
    this.subscribeStatusesSummary = this.USSService.subscribeStatusesSummary('data', this.extractSummary.bind(this));
    this.updateNotifications = this.updateNotifications.bind(this);
    this.updateNotifications();
  }

  private updateNotifications(): void {
    this.ServiceStateChecker.checkState(this.servicesId[0]);
    this.$timeout(this.updateNotifications, 30 * 1000);
  }

  public extractSummary(): void {
    this.userStatusesSummary = this.USSService.extractSummaryForAService(this.servicesId);
    this.ServiceStateChecker.checkUserStatuses(this.servicesId[0]);
  }

  protected firstTimeSetup(): void {
    this.ServiceDescriptorService.isServiceEnabled(this.servicesId[0]).then((enabled) => {
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
        template: require('modules/hercules/service-specific-pages/common-expressway-based/add-resource-modal.html'),
        type: 'small',
      })
        .result
        .catch(() => {
          this.$state.go('services-overview');
        });
    }).catch((response) => {
      this.Notification.errorWithTrackingId(response, 'hercules.genericFailure');
    });
  }

}
