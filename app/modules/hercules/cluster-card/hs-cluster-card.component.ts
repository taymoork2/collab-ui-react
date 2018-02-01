import { IToolkitModalService } from 'modules/core/modal';
import { HybridServicesI18NService } from 'modules/hercules/services/hybrid-services-i18n.service';
import { HybridServicesUtilsService } from 'modules/hercules/services/hybrid-services-utils.service';
import { HybridServiceId, ClusterTargetType, IExtendedClusterFusion } from 'modules/hercules/hybrid-services.types';

export class ClusterCardController implements ng.IComponentController {
  private cluster: IExtendedClusterFusion;
  public formatTimeAndDate = this.HybridServicesI18NService.formatTimeAndDate;
  public getLocalizedReleaseChannel = this.HybridServicesI18NService.getLocalizedReleaseChannel;
  public hybridServicesComparator = this.HybridServicesUtilsService.hybridServicesComparator;

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private $state: ng.ui.IStateService,
    private $window: ng.IWindowService,
    private HybridServicesI18NService: HybridServicesI18NService,
    private HybridServicesUtilsService: HybridServicesUtilsService,
  ) { }

  public countHosts() {
    return _.chain(this.cluster.connectors)
      .map('hostname')
      .uniq()
      .size()
      .value();
  }

  public getHostnames() {
    return _.chain(this.cluster.connectors)
      .map('hostname')
      .uniq()
      .sortBy()
      .map(_.escape)
      .join('<br />')
      .value();
  }

  public goToExpressway(hostname: string): void {
    this.$window.open(`https://${encodeURIComponent(hostname)}/fusionregistration`);
  }

  public hasServices(): boolean {
    return _.some(this.cluster.extendedProperties.servicesStatuses, (serviceStatus) => {
      return serviceStatus.serviceId !== 'squared-fusion-mgmt' && serviceStatus.total > 0;
    });
  }

  public hideFooter(cluster: IExtendedClusterFusion): boolean {
    // these target types don't have setting/nodes,
    // so hide the links in the footer
    return _.includes(['cs_mgmt'], cluster.targetType);
  }

  public openDeleteConfirm(cluster: IExtendedClusterFusion): void {
    this.$modal.open({
      resolve: {
        cluster: () => cluster,
      },
      controller: 'ClusterDeregisterController',
      controllerAs: 'clusterDeregister',
      template: require('modules/hercules/rename-and-deregister-cluster-section/deregister-dialog.html'),
      type: 'dialog',
    })
    .result
    .then(() => {
      this.$state.go('cluster-list', {}, { reload: true });
    });
  }

  public openNodes(type: ClusterTargetType, id: string): void {
    const params = {
      id: id,
      backState: 'cluster-list',
    };
    if (type === 'c_mgmt') {
      this.$state.go('expressway-cluster.nodes', params);
    } else if (type === 'mf_mgmt') {
      this.$state.go('mediafusion-cluster.nodes', params);
    } else if (type === 'hds_app') {
      this.$state.go('hds-cluster.nodes', params);
    } else if (type === 'ucm_mgmt') {
      this.$state.go('cucm-cluster.nodes', params);
    } else if (type === 'cs_mgmt') {
      this.$state.go('context-cluster.nodes', params);
    }
  }

  public openService(serviceId: HybridServiceId, clusterId: string): void {
    if (serviceId === 'squared-fusion-uc') {
      this.$state.go('call-service.list', {
        backState: 'cluster-list',
        clusterId: clusterId,
      });
    } else if (serviceId === 'squared-fusion-cal') {
      this.$state.go('calendar-service.list', {
        backState: 'cluster-list',
        clusterId: clusterId,
      });
    } else if (serviceId === 'spark-hybrid-impinterop') {
      this.$state.go('imp-service.list', {
        backState: 'cluster-list',
        clusterId: clusterId,
      });
    } else if (serviceId === 'squared-fusion-media') {
      this.$state.go('media-service-v2.list', {
        backState: 'cluster-list',
        clusterId: clusterId,
      });
    } else if (serviceId === 'spark-hybrid-datasecurity') {
      this.$state.go('hds.list', {
        backState: 'cluster-list',
        clusterId: clusterId,
      });
    } else if (serviceId === 'contact-center-context') {
      this.$state.go('context-resources', {
        backState: 'cluster-list',
        clusterId: clusterId,
      });
    } else if (serviceId === 'ept') {
      this.$state.go('private-trunk-overview.list', {
        backState: 'cluster-list',
        clusterId: clusterId,
      });
    }
  }

  public openSettings(type: ClusterTargetType, id: string): void {
    if (type === 'c_mgmt') {
      this.$state.go('expressway-cluster.settings', {
        id: id,
      });
    } else if (type === 'mf_mgmt') {
      this.$state.go('mediafusion-cluster.settings', {
        id: id,
      });
    } else if (type === 'hds_app') {
      this.$state.go('hds-cluster.settings', {
        id: id,
      });
    } else if (type === 'ucm_mgmt') {
      this.$state.go('cucm-cluster.settings', {
        id: id,
      });
    } else if (type === 'ept') {
      this.$state.go('private-trunk-settings', {
        id: id,
      });
    }
  }

  public upgradesAutomatically(cluster: IExtendedClusterFusion): boolean {
    // these target types don't follow an upgrade
    // schedule but instead upgrade automatically
    return _.includes(['cs_mgmt'], cluster.targetType);
  }

  public showLinkToNodesPage(): boolean {
    // Doesn't make sense for empty Expressways and EPT
    return !(this.cluster.extendedProperties.isEmpty && this.cluster.targetType === 'c_mgmt')
      && this.cluster.targetType !== 'ept';
  }
}

export class ClusterCardComponent implements ng.IComponentOptions {
  public controller = ClusterCardController;
  public template = require('modules/hercules/cluster-card/hs-cluster-card.component.html');
  public bindings = {
    cluster: '<',
  };
}
