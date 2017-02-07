import { IClusterV1 } from 'modules/hercules/herculesInterfaces';

export class NodeListComponentCtrl implements ng.IComponentController {

  private cluster: IClusterV1;
  private hosts;
  public connectorType;
  public getSeverity = this.FusionClusterStatesService.getSeverity;
  public localizedManagementConnectorName = this.$translate.instant('hercules.connectorNameFromConnectorType.c_mgmt');
  public localizedConnectorName = this.$translate.instant(`hercules.connectorNameFromConnectorType.${this.connectorType}`);

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private FusionClusterService,
    private FusionClusterStatesService,
  ) {}

  public $onInit() {
    if (this.cluster) {
      this.FusionClusterService.get(this.cluster.id)
        .then(cluster => {
          this.hosts = this.FusionClusterService.buildSidepanelConnectorList(cluster, this.connectorType);
        });
    }
  }

  public sortConnectors(connector1): number {
    if (connector1.connectorType === 'c_mgmt') {
      return -1;
    } else {
      return 1;
    }
  }

  public hasConnectors = () => {
    return this.cluster && this.cluster.connectors.length > 0;
  }

}

export class NodeListComponent implements ng.IComponentOptions {
  public controller = NodeListComponentCtrl;
  public templateUrl = 'modules/hercules/cluster-sidepanel/node-list/node-list.html';
  public bindings = {
    cluster: '<',
    connectorType: '<',
  };
}
