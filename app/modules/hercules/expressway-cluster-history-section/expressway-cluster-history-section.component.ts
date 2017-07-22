import { IToolkitModalService } from 'modules/core/modal';

class ExpresswayClusterHistorySectionCtrl implements ng.IComponentController {

  private clusterId;
  private clusterName;

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
  ) { }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { clusterId, clusterName } = changes;
    if (clusterId && clusterId.currentValue) {
      this.clusterId = clusterId.currentValue;
    }
    if (clusterName && clusterName.currentValue) {
      this.clusterName = clusterName.currentValue;
    }
  }

  public launchHistoryWindow() {
    this.$modal.open({
      resolve: {
        clusterId: () => this.clusterId,
        clusterName: () => this.clusterName,
      },
      controller: 'ExpresswayClusterHistoryModalWindowController',
      controllerAs: 'vm',
      templateUrl: 'modules/hercules/expressway-cluster-history-section/expressway-cluster-history-modal-window.html',
    });
  }

}

export class ExpresswayClusterHistorySectionComponent implements ng.IComponentOptions {
  public controller = ExpresswayClusterHistorySectionCtrl;
  public templateUrl = 'modules/hercules/expressway-cluster-history-section/expressway-cluster-history-section.html';
  public bindings = {
    clusterId: '<',
    clusterName: '<',
  };
}
