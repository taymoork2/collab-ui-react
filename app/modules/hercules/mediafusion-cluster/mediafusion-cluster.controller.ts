export class MediafusionClusterController {
  public tabs: any[] = [];
  public localizedTitle: string;
  public backUrl: string = 'cluster-list';
  public name: string;

  /* @ngInject */
  constructor(
    private $stateParams: ng.ui.IStateParamsService,
    private $translate: ng.translate.ITranslateService,
    private FusionClusterService,
    private hasNodesViewFeatureToggle: boolean,
  ) {
    this.FusionClusterService.get(this.$stateParams['id'])
      .then(cluster => {
        this.updateName(cluster.name);
        // Don't show any tabs if the "Nodes" one is not available
        if (this.hasNodesViewFeatureToggle) {
          this.tabs = [{
            title: this.$translate.instant('common.nodes'),
            state: 'mediafusion-cluster.nodes',
          }, {
            title: this.$translate.instant('common.settings'),
            state: 'mediafusion-cluster.settings',
          }];
        }
      });
  }

  public updateName(name: string): void {
    this.localizedTitle = this.$translate.instant('hercules.expresswayClusterSettings.pageTitle', {
      clusterName: name,
    });
  }
}

angular
  .module('Hercules')
  .controller('MediafusionClusterController', MediafusionClusterController);
