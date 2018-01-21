import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { Notification } from 'modules/core/notifications';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';

export class DeactivateMediaService {
  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $state: ng.ui.IStateService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private MediaServiceActivationV2,
    private Notification: Notification,
    private ServiceDescriptorService: ServiceDescriptorService,
  ) {}
  public clusterNames: string[];
  public clusterIds: string[];
  public serviceId: any = 'squared-fusion-media';

  private getClusterList() {
    return this.HybridServicesClusterService.getAll()
      .then((clusters) => {
        return _.filter(clusters, {
          targetType: 'mf_mgmt',
        });
      })
      .catch(() => []);
  }

  public deactivateHybridMediaService() {
    this.getClusterList()
      .then((clusters) => {
        this.clusterNames = _.map(clusters, 'name'),
        this.clusterIds = _.map(clusters, 'id'),
        this.clusterNames.sort();
      })
      .then(() => {
        const promises = _.map(this.clusterIds, (clusterId) => this.HybridServicesClusterService.deregisterCluster(clusterId));
        this.$q.all(promises)
        .then(() => {
          this.ServiceDescriptorService.disableService(this.serviceId);
          this.MediaServiceActivationV2.setIsMediaServiceEnabled(false);
          this.MediaServiceActivationV2.disableOrpheusForMediaFusion();
          this.MediaServiceActivationV2.deactivateHybridMedia();
          return this.MediaServiceActivationV2.disableMFOrgSettingsForDevOps();
        })
        .catch((error) => {
          this.Notification.errorWithTrackingId(error, 'mediaFusion.deactivate.error');
        })
        .finally(() => {
          this.$state.go('services-overview');
        });
      });
  }
}

angular
.module('Mediafusion')
.service('DeactivateMediaService', DeactivateMediaService);
