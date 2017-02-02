import { IClusterV1 } from 'modules/hercules/herculesInterfaces';
import { Notification } from 'modules/core/notifications';

interface IClusterV1withAllowedredirectTarget extends IClusterV1 {
  allowedRedirectTarget: any;
}

export class CompleteregistrationOrRemoveExpresswayCtrl implements ng.IComponentController {

  private cluster: IClusterV1withAllowedredirectTarget;
  private connectorType: string;

  /* @ngInject */
  constructor(
    private $modal,
    private $state: ng.ui.IStateService,
    private $window: ng.IWindowService,
    private FusionClusterService,
    private Notification: Notification,
  ) {

  }

  public $onInit() {
    if (this.cluster && _.size(this.cluster.connectors) === 0) {
      this.FusionClusterService.getPreregisteredClusterAllowList()
        .then(allowList => {
          this.cluster.allowedRedirectTarget = _.find(allowList, { clusterId: this.cluster.id });
        })
        .catch(error => {
          this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        });
    }
  }

  public openDeleteConfirm(): void {
    this.$modal.open({
      resolve: {
        cluster: () => {
          return this.cluster;
        },
      },
      controller: 'ClusterDeregisterController',
      controllerAs: 'clusterDeregister',
      templateUrl: 'modules/hercules/fusion-pages/components/rename-and-deregister-cluster-section/deregister-dialog.html',
      type: 'dialog',
    }).result
      .then(() => {
        if (this.connectorType === 'c_cal') {
          this.$state.go('calendar-service.list');
        } else if (this.connectorType === 'c_ucmc') {
          this.$state.go('call-service.list');
        }
    });
  }

  public goToExpressway(hostname: string): void {
    this.$window.open('https://' + encodeURIComponent(hostname) + '/fusionregistration');
  }

}

export class CompleteregistrationOrRemoveExpresswayComponent implements ng.IComponentOptions {
  public controller = CompleteregistrationOrRemoveExpresswayCtrl;
  public templateUrl = 'modules/hercules/cluster-sidepanel/complete-registration-or-remove-expressway/complete-registration-or-remove-expressway.html';
  public bindings = {
    cluster: '<',
    connectorType: '<',
  };
}
