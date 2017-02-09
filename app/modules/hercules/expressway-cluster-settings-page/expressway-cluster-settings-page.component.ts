import { Notification } from 'modules/core/notifications';

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
  public localizedClusterNameWatermark = this.$translate.instant('hercules.expresswayClusterSettings.clusterNameWatermark');
  public hasResourceGroupFeatureToggle: boolean;

  /* @ngInject */
  constructor(
    private $modal,
    private $rootScope: ng.IRootScopeService,
    private $translate: ng.translate.ITranslateService,
    private FusionClusterService,
    private Notification: Notification,
    private ResourceGroupService,
  ) {
    this.buildResourceOptions = this.buildResourceOptions.bind(this);
    this.getCurrentResourceGroup = this.getCurrentResourceGroup.bind(this);
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }) {
    let clusterId = changes['clusterId'];
    if (clusterId && clusterId.currentValue) {
      this.loadCluster(clusterId.currentValue);
    }
  }

  private loadCluster(clusterId) {
    this.refreshClusterData(clusterId)
      .then(cluster => {
        this.enabledServices = _.map<any, string>(cluster.provisioning, 'connectorType');

        if (this.hasResourceGroupFeatureToggle) {
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
        }
      })
      .catch(error => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      });
  }

  private refreshClusterData(id) {
    return this.FusionClusterService.get(id)
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
        templateUrl: 'modules/hercules/fusion-pages/remove-from-resource-group-dialog.html',
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
              const willUpgrade = isUpgradingConnectors ? this.$translate.instant('hercules.expresswayClusterSettings.allConnectorsWillBeUpgraded') : '';
              this.Notification.success(this.$translate.instant('hercules.expresswayClusterSettings.removeFromResourceGroupSuccess', {
                ClusterName: this.cluster.name,
                ResourceGroup: this.originalResourceGroup.groupName,
              }) + ' ' + willUpgrade);
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
        templateUrl: 'modules/hercules/fusion-pages/assign-new-resource-group-dialog.html',
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
              const willUpgrade = isUpgradingConnectors ? this.$translate.instant('hercules.expresswayClusterSettings.allConnectorsWillBeUpgraded') : '';
              this.Notification.success(this.$translate.instant('hercules.expresswayClusterSettings.moveResourceGroupSuccess', {
                ClusterName: this.cluster.name,
                NewResourceGroup: this.selectedResourceGroup.groupName,
              }) + ' ' + willUpgrade);
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
      if (service === 'c_mgmt') {
        return this.$translate.instant('hercules.connectorNameFromConnectorType.c_mgmt');
      }
    });
  }

  public deactivateService(serviceId, cluster) {
    this.$modal.open({
      templateUrl: 'modules/hercules/resource-settings/deactivate-service-on-expressway-modal.html',
      controller: 'DeactivateServiceOnExpresswayModalController',
      controllerAs: 'deactivateServiceOnExpresswayModal',
      type: 'small',
      resolve: {
        serviceId: () => serviceId,
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
    return connector === 'c_cal' || connector === 'c_ucmc';
  }

  public getLocalizedServiceName(connector) {
    return this.$translate.instant('hercules.serviceNameFromConnectorType.' + connector);
  }

  /* Callback function used by <rename-and-deregister-cluster-section>  */
  public nameUpdated(name) {
    this.$rootScope.$emit('cluster-name-update', name);
  }
}

export class ExpresswayClusterSettingsPageComponent implements ng.IComponentOptions {
  public controller = ExpresswayClusterSettingsPageCtrl;
  public templateUrl = 'modules/hercules/expressway-cluster-settings-page/expressway-cluster-settings-page.html';
  public bindings = {
    clusterId: '<',
    hasResourceGroupFeatureToggle: '<',
  };
}
