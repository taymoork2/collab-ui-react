class RenameAndDeregisterClusterSectionCtrl implements ng.IComponentController {

  private clusterId: string;

  private serviceId: string;
  private cluster: any;
  private deregisterModalData: any;
  private onUpdate;

  public clusterName: string;
  public clusterType: string;
  public savingNameState: boolean = false;
  public clusterSection = {
    title: 'common.cluster',
  };
  public localizedClusterNameWatermark: string;

  /* @ngInject */
  constructor(
    private $modal,
    private $translate: ng.translate.ITranslateService,
    private $state: ng.ui.IStateService,
    private Notification,
    private FusionClusterService,
  ) { }

  public $onInit() {
    this.localizedClusterNameWatermark = this.$translate.instant('hercules.renameAndDeregisterComponent.clusterNameWatermark');
    this.clusterType = this.$translate.instant('hercules.clusterTypeFromServiceId.' + this.serviceId);
  }

  public $onChanges() {

    /*  It might take a while before the parent has the cluster data,
        so this part must be here, and not in $onInit() */
    if (this.cluster) {
      this.clusterName = this.cluster.name;
      this.clusterId = this.cluster.id;

      /* No deregisterModalData provided means that we fall back to the default one  */
      if (this.deregisterModalData === undefined) {
        this.deregisterModalData = {
          resolve: {
            cluster: () => {
              return this.cluster;
            },
          },
          controller: 'ClusterDeregisterController',
          controllerAs: 'clusterDeregister',
          templateUrl: 'modules/hercules/fusion-pages/components/rename-and-deregister-cluster-section/deregister-dialog.html',
          type: 'dialog',
        };
      }
    }

  }

  public saveClusterName(): void {
    if (this.clusterName === '') {
      this.Notification.error('hercules.renameAndDeregisterComponent.clusterNameCannotByEmpty');
      return;
    }

    this.savingNameState = true;
    this.FusionClusterService.setClusterName(this.clusterId, this.clusterName)
      .then(() => {
        this.Notification.success('hercules.renameAndDeregisterComponent.clusterNameSaved');
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.renameAndDeregisterComponent.clusterNameCannotBeSaved');
      })
      .finally(() => {
        this.savingNameState = false;
        this.onUpdate();
      });
  }

  public deregisterCluster(): void {
    this.$modal.open(this.deregisterModalData)
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
  public templateUrl = 'modules/hercules/fusion-pages/components/rename-and-deregister-cluster-section/rename-and-deregister-cluster.html';
  public bindings = {
    serviceId: '<',
    cluster: '<',
    deregisterModalData: '<',
    onUpdate: '&',
  };
}
