import { Notification } from 'modules/core/notifications';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { ConnectorType } from 'modules/hercules/hybrid-services.types';
import { ResourceGroupService } from 'modules/hercules/services/resource-group.service';
import { FeatureToggleService } from 'modules/core/featureToggle';

interface IResourceGroupOptions {
  label: string;
  value: string;
  groupName: string;
  releaseChannel: string;
}

class ExpresswayClusterSettingsPageCtrl implements ng.IComponentController {
  public enabledServices: string[] = [];
  public cluster: any;
  public clusterId: string;
  public hasHybridGlobalCallServiceConnectFeature: boolean;
  public resourceGroupOptions: IResourceGroupOptions[];
  public originalResourceGroup: IResourceGroupOptions;
  public selectedResourceGroup: IResourceGroupOptions;
  public upgradeSchedule = {
    title: 'hercules.expresswayClusterSettings.upgradeScheduleHeader',
  };
  public resourceGroup = {
    title: 'hercules.expresswayClusterSettings.resourceGroupsHeader',
  };
  public deactivateServices = {
    title: 'hercules.expresswayClusterSettings.deactivateServicesHeader',
  };

  /* @ngInject */
  constructor(
    private $modal,
    private $rootScope: ng.IRootScopeService,
    private $translate: ng.translate.ITranslateService,
    private FeatureToggleService: FeatureToggleService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private Notification: Notification,
    private ResourceGroupService: ResourceGroupService,
  ) {
    this.buildResourceOptions = this.buildResourceOptions.bind(this);
    this.getCurrentResourceGroup = this.getCurrentResourceGroup.bind(this);
  }

  public $onInit() {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasHybridGlobalCallServiceConnect)
      .then(support => {
        this.hasHybridGlobalCallServiceConnectFeature = support;
      });
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { clusterId } = changes;
    if (clusterId && clusterId.currentValue) {
      this.loadCluster(clusterId.currentValue);
    }
  }

  private loadCluster(clusterId) {
    this.refreshClusterData(clusterId)
      .then(cluster => {
        this.enabledServices = _.map<any, string>(cluster.provisioning, 'connectorType');

        this.ResourceGroupService.getAll()
          .then(this.buildResourceOptions)
          .then(groups => {
            this.resourceGroupOptions = groups;
            return cluster.resourceGroupId;
          })
          .then(this.getCurrentResourceGroup)
          .then(group => {
            this.originalResourceGroup = group;
            this.selectedResourceGroup = group;
          });
      })
      .catch(error => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      });
  }

  private refreshClusterData(id) {
    return this.HybridServicesClusterService.get(id)
      .then((cluster) => {
        this.cluster = cluster;
        return cluster;
      });
  }

  public showResourceGroupModal() {
    const isUpgradingConnectors = this.originalResourceGroup.releaseChannel !== this.selectedResourceGroup.releaseChannel;
    const component = this;
    if (this.selectedResourceGroup.value === '') { // user is removing resource group
      this.$modal.open({
        template: require('modules/hercules/fusion-pages/remove-from-resource-group-dialog.html'),
        type: 'dialog',
        controller: function () {
          const ctrl = this;
          ctrl.clusterName = component.cluster.name;
          ctrl.currentGroup = component.originalResourceGroup.groupName;
          ctrl.isUpgradingConnectors = isUpgradingConnectors;
          ctrl.connectors = component.buildConnectorList(component.enabledServices);
        },
        controllerAs: 'ctrl',
      })
        .result.then(() => {
          this.ResourceGroupService.assign(this.cluster.id, '')
            .then(() => {
              if (isUpgradingConnectors) {
                this.Notification.success('hercules.expresswayClusterSettings.removeFromResourceGroupSuccessWithUpgrade', {
                  ClusterName: this.cluster.name,
                  ResourceGroup: this.originalResourceGroup.groupName,
                });
              } else {
                this.Notification.success('hercules.expresswayClusterSettings.removeFromResourceGroupSuccess', {
                  ClusterName: this.cluster.name,
                  ResourceGroup: this.originalResourceGroup.groupName,
                });
              }
              this.originalResourceGroup = this.selectedResourceGroup;
              this.refreshClusterData(this.cluster.id);
            })
            .catch(error => {
              this.selectedResourceGroup = this.originalResourceGroup;
              this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
            });
        })
        .catch(() => {
          this.selectedResourceGroup = this.originalResourceGroup;
        });
    } else { // user is setting a new resource group
      this.$modal.open({
        template: require('modules/hercules/fusion-pages/assign-new-resource-group-dialog.html'),
        type: 'dialog',
        controller: function () {
          const ctrl = this;
          ctrl.clusterName = component.cluster.name;
          ctrl.newGroup = component.selectedResourceGroup.groupName;
          ctrl.isUpgradingConnectors = isUpgradingConnectors;
          ctrl.connectors = component.buildConnectorList(component.enabledServices);
        },
        controllerAs: 'ctrl',
      })
        .result.then(() => {
          this.ResourceGroupService.assign(this.cluster.id, this.selectedResourceGroup.value)
            .then(() => {
              if (isUpgradingConnectors) {
                this.Notification.success('hercules.expresswayClusterSettings.moveResourceGroupSuccessWithUpgrade', {
                  ClusterName: this.cluster.name,
                  NewResourceGroup: this.selectedResourceGroup.groupName,
                });
              } else {
                this.Notification.success('hercules.expresswayClusterSettings.moveResourceGroupSuccess', {
                  ClusterName: this.cluster.name,
                  NewResourceGroup: this.selectedResourceGroup.groupName,
                });
              }
              this.originalResourceGroup = this.selectedResourceGroup;
              this.refreshClusterData(this.cluster.id);
            })
            .catch(error => {
              this.selectedResourceGroup = this.originalResourceGroup;
              this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
            });
        })
        .catch(() => {
          this.selectedResourceGroup = this.originalResourceGroup;
        });
    }
  }

  private buildResourceOptions(groups) {
    const resourceGroupsOptions = [{
      label: this.$translate.instant('hercules.resourceGroups.noGroupSelected'),
      value: '',
      groupName: '',
      releaseChannel: 'stable',
    }];
    if (groups && groups.length > 0) {
      _.each(groups, group => {
        resourceGroupsOptions.push({
          label: group.name + (group.releaseChannel ? ' (' + this.$translate.instant('hercules.fusion.add-resource-group.release-channel.' + group.releaseChannel) + ')' : ''),
          value: group.id,
          groupName: group.name,
          releaseChannel: group.releaseChannel,
        });
      });
    }
    return _.sortBy(resourceGroupsOptions, o => o.groupName);
  }

  private getCurrentResourceGroup(resourceGroupId) {
    if (resourceGroupId) {
      return this.ResourceGroupService.get(resourceGroupId)
        .then(response => {
          return _.find(this.resourceGroupOptions, option => option.value === response.id);
        });
    } else {
      return this.resourceGroupOptions[0];
    }
  }

  private buildConnectorList(services) {
    return _.map(services, service => {
      if (service === 'c_cal') {
        return this.$translate.instant('hercules.connectorNameFromConnectorType.c_cal');
      }
      if (service === 'c_ucmc') {
        return this.$translate.instant('hercules.connectorNameFromConnectorType.c_ucmc');
      }
      if (service === 'c_imp') {
        return this.$translate.instant('hercules.connectorNameFromConnectorType.c_imp');
      }
      if (service === 'c_mgmt') {
        return this.$translate.instant('hercules.connectorNameFromConnectorType.c_mgmt');
      }
    });
  }

  public deactivateService(connectorType: ConnectorType, cluster) {
    this.$modal.open({
      template: require('modules/hercules/resource-settings/deactivate-service-on-expressway-modal.html'),
      controller: 'DeactivateServiceOnExpresswayModalController',
      controllerAs: 'vm',
      resolve: {
        connectorType: () => connectorType,
        clusterName: () => cluster.name,
        clusterId: () => cluster.id,
      },
    })
      .result
      .then(() => {
        this.loadCluster(this.clusterId);
      });
  }

  public filterServices(connector) {
    return connector === 'c_cal' || connector === 'c_ucmc' || connector === 'c_imp';
  }

  public getLocalizedServiceName(connector) {
    return this.$translate.instant('hercules.serviceNameFromConnectorType.' + connector);
  }

  /* Callback function used by <hs-rename-and-deregister-cluster-section>  */
  public nameUpdated(name) {
    this.$rootScope.$emit('cluster-name-update', name);
  }
}

export class ExpresswayClusterSettingsPageComponent implements ng.IComponentOptions {
  public controller = ExpresswayClusterSettingsPageCtrl;
  public template = require('./expressway-cluster-settings-page.html');
  public bindings = {
    clusterId: '<',
  };
}
