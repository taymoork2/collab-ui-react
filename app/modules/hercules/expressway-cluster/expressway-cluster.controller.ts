export class ExpresswayClusterController {
  public tabs: any[] = [];
  public localizedTitle: string;
  public backUrl: string = 'cluster-list';
  public name: string;

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $translate: ng.translate.ITranslateService,
    private $stateParams: ng.ui.IStateParamsService,
    private FusionClusterService,
    private hackishWayOfPassingNameUpdateUp: any,
    private hasNodesViewFeatureToggle: boolean,
  ) {
    this.FusionClusterService.get(this.$stateParams['id'])
      .then(cluster => {
        this.name = cluster.name;
        this.localizedTitle = this.$translate.instant('hercules.expresswayClusterSettings.pageTitle', {
          clusterName: this.name,
        });
        // Don't show any tabs if the "Nodes" one is not available
        if (this.hasNodesViewFeatureToggle) {
          this.tabs = [{
            title: this.$translate.instant('common.nodes'),
            state: 'expressway-cluster.nodes',
          }, {
            title: this.$translate.instant('common.settings'),
            state: 'expressway-cluster.settings',
          }];
        }
      });

    this.$scope.$watch(() => this.hackishWayOfPassingNameUpdateUp.name, (newValue, oldValue) => {
      if (newValue !== oldValue) {
        this.name = newValue;
      }
    });
  }
}

angular
  .module('Hercules')
  .controller('ExpresswayClusterController', ExpresswayClusterController);
