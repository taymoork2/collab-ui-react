import { FeatureToggleService } from 'modules/core/featureToggle';
import { Notification } from 'modules/core/notifications';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { IToolkitModalService } from 'modules/core/modal';
import { PrivateTrunkService } from 'modules/hercules/private-trunk/private-trunk-services/private-trunk.service';
import { ICluster } from 'modules/hercules/hybrid-services.types';

export interface IDeregisterModalOptions {
  resolve: {
    cluster: Function;
  };
  controller?: string;
  controllerAs?: string;
  template?: string;
  templateUrl?: string;
  type?: 'dialog' | 'small' | 'full';
}

class ClusterSectionCtrl implements ng.IComponentController {

  private clusterId: string;
  private cluster: ICluster;
  private onNameUpdate: Function;
  private deregisterModalOptions: IDeregisterModalOptions;
  private defaultDeregisterModalOptions: IDeregisterModalOptions = {
    resolve: {
      cluster: () => this.cluster,
    },
    controller: 'ClusterDeregisterController',
    controllerAs: 'clusterDeregister',
    template: require('./deregister-dialog.html'),
    type: 'dialog',
  };

  public atlasHybridAuditLogEnabled = false;
  public showRenameSection: boolean;
  public showSipDestinationSection: boolean;
  public hasHybridGlobalCallServiceConnectFeature: boolean;
  public clusterName: string;
  public clusterType: string;
  public savingNameState: boolean = false;
  public clusterSection;
  public localizedClusterNameWatermark: string = this.$translate.instant('hercules.renameAndDeregisterComponent.clusterNameWatermark');

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private Notification: Notification,
    private PrivateTrunkService: PrivateTrunkService,
    private FeatureToggleService: FeatureToggleService,
  ) { }

  public $onInit() {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasHybridAuditLog)
      .then((enabled: boolean) => {
        this.atlasHybridAuditLogEnabled = enabled;
      });
    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasHybridGlobalCallServiceConnect)
      .then(support => {
        this.hasHybridGlobalCallServiceConnectFeature = support;
      });
  }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {

    const { cluster, deregisterModalOptions } = changes;

    if (cluster && cluster.currentValue) {
      this.cluster = cluster.currentValue;
      this.clusterName = this.cluster.name;
      this.clusterId = this.cluster.id;

      this.clusterType = this.$translate.instant(`hercules.platformNameFromTargetType.${this.cluster.targetType}`);
      if (this.cluster.targetType === 'ept') {
        this.clusterSection = {
          title: 'hercules.clusterListComponent.clusters-title-ept',
        };
      } else {
        this.clusterSection = {
          title: 'common.cluster',
        };
      }
    }

    if (deregisterModalOptions && deregisterModalOptions.currentValue) {
      this.deregisterModalOptions = deregisterModalOptions.currentValue;
    } else if (deregisterModalOptions) {
      this.deregisterModalOptions = this.defaultDeregisterModalOptions;
    }
  }

  public saveClusterName(clusterName): void {
    if (clusterName === '') {
      this.Notification.error('hercules.renameAndDeregisterComponent.clusterNameCannotByEmpty');
      return;
    }
    this.savingNameState = true;
    if (this.cluster.targetType === 'ept') {
      this.PrivateTrunkService.setPrivateTrunkResource(this.clusterId, clusterName)
        .then(() => {
          this.Notification.success('hercules.renameAndDeregisterComponent.sipDestinationNameSaved');
          this.onNameUpdate({ name: clusterName });
          this.cluster.name = clusterName;
        })
        .catch((error) => {
          this.Notification.errorWithTrackingId(error, 'hercules.renameAndDeregisterComponent.sipDestinationNameCannotBeSaved');
        })
        .finally(() => {
          this.savingNameState = false;
        });
    } else {
      this.HybridServicesClusterService.setClusterInformation(this.clusterId, { name: clusterName })
        .then(() => {
          this.Notification.success('hercules.renameAndDeregisterComponent.clusterNameSaved');
          this.onNameUpdate({ name: clusterName });
          this.cluster.name = clusterName;
        })
        .catch((error) => {
          this.Notification.errorWithTrackingId(error, 'hercules.renameAndDeregisterComponent.clusterNameCannotBeSaved');
        })
        .finally(() => {
          this.savingNameState = false;
        });
    }

  }

  public deregisterCluster(): void {
    this.$modal.open(this.deregisterModalOptions)
      .result
      .then(() => {
        this.$state.go('cluster-list');
      });
  }

  public blockDeregistration(): boolean {
    if (_.isUndefined(this.cluster)) {
      return true;
    }
    const provisionedConnectors = _.map(this.cluster.provisioning, 'connectorType');
    return (_.includes(provisionedConnectors, 'c_cal') || _.includes(provisionedConnectors, 'c_ucmc') || _.includes(provisionedConnectors, 'c_imp'));
  }

}

export class ClusterSectionComponent implements ng.IComponentOptions {
  public controller = ClusterSectionCtrl;
  public template = require('./hs-cluster-section.component.html');
  public bindings = {
    cluster: '<',
    deregisterModalOptions: '<',
    onNameUpdate: '&',
    showRenameSection: '<',
    showSipDestinationSection: '<',
  };
}
