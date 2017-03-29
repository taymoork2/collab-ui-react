import { Notification } from 'modules/core/notifications';

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
    templateUrl: 'modules/hercules/fusion-pages/components/rename-and-deregister-cluster-section/deregister-dialog.html',
    type: 'dialog',
  };

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
    private $modal,
    private $translate: ng.translate.ITranslateService,
    private $state: ng.ui.IStateService,
    private Notification: Notification,
    private FusionClusterService,
  ) { }

  public $onInit() {
    this.clusterType = this.$translate.instant(`hercules.clusterTypeFromServiceId.${this.serviceId}`);
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
    this.FusionClusterService.setClusterName(this.clusterId, clusterName)
      .then(() => {
        this.Notification.success('hercules.renameAndDeregisterComponent.clusterNameSaved');
        this.onNameUpdate({ name: clusterName });
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.renameAndDeregisterComponent.clusterNameCannotBeSaved');
      })
      .finally(() => {
        this.savingNameState = false;
      });
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
