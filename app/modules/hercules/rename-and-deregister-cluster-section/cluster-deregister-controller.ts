import { ICluster } from 'modules/hercules/hybrid-services.types';
import { EnterprisePrivateTrunkService } from 'modules/hercules/services/enterprise-private-trunk-service';
import { Notification } from 'modules/core/notifications/notification.service';

export class ClusterDeregisterController {

  public loading = false;

  /* @ngInject */
  constructor(
    private $modalInstance,
    private $translate: ng.translate.ITranslateService,
    private cluster: ICluster,
    private FusionClusterService,
    private EnterprisePrivateTrunkService: EnterprisePrivateTrunkService,
    private Notification: Notification,
  ) { }

  public deregister() {

    let deregisterCluster = this.FusionClusterService.deregisterCluster;
    if (this.cluster.targetType === 'ept') {
      deregisterCluster = this.EnterprisePrivateTrunkService.deleteTrunk;
    }

    this.loading = true;
    deregisterCluster(this.cluster.id)
      .then(() => {
        this.Notification.success(this.$translate.instant('hercules.renameAndDeregisterComponent.deregisterConfirmPopup', {
          clusterName: this.cluster.name,
        }));
        this.$modalInstance.close();
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        this.loading = false;
      });

  }
}

angular
  .module('Hercules')
  .controller('ClusterDeregisterController', ClusterDeregisterController);
