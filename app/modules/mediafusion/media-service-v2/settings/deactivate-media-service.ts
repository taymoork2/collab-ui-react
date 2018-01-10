import { Notification } from 'modules/core/notifications';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';

export class DeactivateMediaService {
  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $state: ng.ui.IStateService,
    private Notification: Notification,
    private MediaServiceActivationV2,
    private HybridServicesClusterService: HybridServicesClusterService,
    private ServiceDescriptorService: ServiceDescriptorService,
  ) {}
  public clusterNames: any[];
  public clusterIds: any[];
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
        const promises: ng.IPromise<any>[] = [];
        _.forEach(this.clusterIds, cluster => {
          promises.push(this.HybridServicesClusterService.deregisterCluster(cluster));
        });
        this.$q.all(promises)
        .then(() => {
          this.ServiceDescriptorService.disableService(this.serviceId);
          this.MediaServiceActivationV2.setisMediaServiceEnabled(false);
          this.MediaServiceActivationV2.disableOrpheusForMediaFusion();
          this.MediaServiceActivationV2.deactivateHybridMedia();
          this.MediaServiceActivationV2.disableMFOrgSettingsForDevOps();
        })
        .catch(() => {
          this.Notification.error('mediaFusion.deactivate.error');
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
