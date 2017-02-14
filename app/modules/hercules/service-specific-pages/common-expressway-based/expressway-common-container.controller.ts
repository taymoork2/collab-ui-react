import { Notification } from 'modules/core/notifications';

export abstract class ExpresswayContainerController {

  public backState = 'services-overview';
  public userStatusesSummary = [];
  protected subscribeStatusesSummary: any;

  /* @ngInject */
  constructor(private $modal,
              private $scope: ng.IScope,
              private $state: ng.ui.IStateService,
              private Authinfo,
              private ClusterService,
              private Notification: Notification,
              protected ServiceDescriptor,
              private ServiceStateChecker,
              protected USSService,
              protected servicesId: string[],
              private connectorType: string ) {
    this.firstTimeSetup();
    this.extractSummary();
    this.subscribeStatusesSummary = this.USSService.subscribeStatusesSummary('data', this.extractSummary.bind(this));
    this.ClusterService.subscribe('data', this.updateNotifications.bind(this), {
      scope: this.$scope,
    });
  }

  private updateNotifications(): void {
    this.ServiceStateChecker.checkState(this.servicesId[0]);
  }

  public extractSummary(): void {
    this.userStatusesSummary = this.USSService.extractSummaryForAService(this.servicesId);
    this.ServiceStateChecker.checkUserStatuses(this.servicesId[0]);
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
      if (this.Authinfo.isCustomerLaunchedFromPartner()) {
        this.$modal.open({
          templateUrl: 'modules/hercules/service-specific-pages/components/add-resource/partnerAdminWarning.html',
          type: 'dialog',
        });
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
