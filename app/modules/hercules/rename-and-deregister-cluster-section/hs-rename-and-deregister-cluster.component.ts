import { Notification } from 'modules/core/notifications';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import { IToolkitModalService } from 'modules/core/modal';
import { PrivateTrunkService } from 'modules/hercules/private-trunk/private-trunk-services/private-trunk.service';

class RenameAndDeregisterClusterSectionCtrl implements ng.IComponentController {

  private clusterId: string;
  private cluster: any;
  private onNameUpdate: Function;
  private deregisterModalOptions: any;
  private defaultDeregisterModalOptions: any = {
    resolve: {
      cluster: () => this.cluster,
    },
    controller: 'ClusterDeregisterController',
    controllerAs: 'clusterDeregister',
    templateUrl: 'modules/hercules/rename-and-deregister-cluster-section/deregister-dialog.html',
    type: 'dialog',
  };

  public nameChangeEnabled: boolean = false;
  public serviceId: string;
  public showRenameSection: boolean;
  public clusterName: string;
  public clusterType: string;
  public savingNameState: boolean = false;
  public clusterSection = {
    title: 'common.cluster',
  };
  public localizedClusterNameWatermark: string = this.$translate.instant('hercules.renameAndDeregisterComponent.clusterNameWatermark');

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private Notification: Notification,
    private PrivateTrunkService: PrivateTrunkService,
    private FeatureToggleService,
  ) { }

  public $onInit() {
    this.FeatureToggleService.atlas2017NameChangeGetStatus().then((toggle: boolean): void => {
      this.nameChangeEnabled = toggle;
    });

    this.clusterType = this.$translate.instant(`hercules.clusterTypeFromServiceId.${this.serviceId}`);
    if (this.serviceId === 'ept') {
      this.clusterSection = {
        title: 'hercules.clusterListComponent.clusters-title-ept',
      };
    }
  }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject}) {

    const { cluster, deregisterModalOptions } = changes;

    if (cluster && cluster.currentValue) {
      this.cluster = cluster.currentValue;
      this.clusterName = this.cluster.name;
      this.clusterId = this.cluster.id;
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
    if (this.serviceId === 'ept') {
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
    let provisionedConnectors = _.map(this.cluster.provisioning, 'connectorType');
    return (_.includes(provisionedConnectors, 'c_cal') || _.includes(provisionedConnectors, 'c_ucmc'));
  }

}

export class RenameAndDeregisterClusterSectionComponent implements ng.IComponentOptions {
  public controller = RenameAndDeregisterClusterSectionCtrl;
  public templateUrl = 'modules/hercules/rename-and-deregister-cluster-section/hs-rename-and-deregister-cluster.component.html';
  public bindings = {
    serviceId: '<',
    cluster: '<',
    showRenameSection: '<',
    deregisterModalOptions: '<',
    onNameUpdate: '&',
  };
}
