import { HybridServiceClusterListCtrl, IGridApiScope, IClusterIdStateParam, HybridServiceClusterListComponent } from '../../hercules/service-specific-pages/components/cluster-list/hybrid-service-cluster-list.component';
class HDSServiceClusterListCtrl extends HybridServiceClusterListCtrl {
    /* @ngInject */
    constructor(
        $translate: ng.translate.ITranslateService,
        $scope: IGridApiScope,
        $state: ng.ui.IStateService,
        $stateParams: IClusterIdStateParam,
        ClusterService,
        FusionClusterService,
        FusionClusterStatesService,
        FusionUtils,
    ) { super($translate,
              $scope,
              $state,
              $stateParams,
              ClusterService,
              FusionClusterService,
              FusionClusterStatesService,
              FusionUtils);
        }

    private sortByProperty(property) {
      return function (a, b) {
        return a[property].toLocaleUpperCase().localeCompare(b[property].toLocaleUpperCase());
      };
    }

    protected updateClusters() {
        this.clusterList = this.ClusterService.getClustersByConnectorType('hds_app');
        this.clusterList.sort(this.sortByProperty('name'));
    }
}

class HDSServiceClusterListComponent extends HybridServiceClusterListComponent {
    public controller = HDSServiceClusterListCtrl;
}

export default angular
    .module('HDS')
    .component('hdsServiceClusterList', new HDSServiceClusterListComponent())
    .name;
