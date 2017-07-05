import { ICluster } from 'modules/hercules/hybrid-services.types';
import { Notification } from 'modules/core/notifications/notification.service';
import { PrivateTrunkService } from 'modules/hercules/private-trunk/private-trunk-services/private-trunk.service';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';

export class ClusterDeregisterController {
  public loading: boolean = false;
  public nameChangeEnabled: boolean = false;

  /* @ngInject */
  constructor(
    private $modalInstance,
    private cluster: ICluster,
    private HybridServicesClusterService: HybridServicesClusterService,
    private PrivateTrunkService: PrivateTrunkService,
    private Notification: Notification,
    private FeatureToggleService,
  ) {
    this.FeatureToggleService.atlas2017NameChangeGetStatus().then((toggle: boolean): void => {
      this.nameChangeEnabled = toggle;
    });
  }

  public deregister() {
    this.loading = true;
    if (this.cluster.targetType === 'ept') {
      this.PrivateTrunkService.removePrivateTrunkResource(this.cluster.id)
        .then(() => {
          this.callNotification();
          this.$modalInstance.close();
        })
        .catch((error) => {
          this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
          this.loading = false;
        });
    } else {
      this.HybridServicesClusterService.deregisterCluster(this.cluster.id)
        .then(() => {
          this.callNotification();
          this.$modalInstance.close();
        })
        .catch((error) => {
          this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
          this.loading = false;
        });
    }
  }

  private callNotification(): void {
    if (this.nameChangeEnabled) {
      this.Notification.success('hercules.renameAndDeregisterComponent.deregisterConfirmPopupNew', {
        clusterName: this.cluster.name,
      });
    } else {
      this.Notification.success('hercules.renameAndDeregisterComponent.deregisterConfirmPopup', {
        clusterName: this.cluster.name,
      });
    }
  }
}

angular
  .module('Hercules')
  .controller('ClusterDeregisterController', ClusterDeregisterController);
