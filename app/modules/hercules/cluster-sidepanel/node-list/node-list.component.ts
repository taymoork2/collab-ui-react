import { ICluster } from 'modules/hercules/hybrid-services.types';
import { Notification } from 'modules/core/notifications/notification.service';
import { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';

export class NodeListComponentCtrl implements ng.IComponentController {

  private cluster: ICluster;
  private hosts;
  public connectorType;
  public getSeverity = this.HybridServicesClusterStatesService.getSeverity;
  public localizedManagementConnectorName = this.$translate.instant('hercules.connectorNameFromConnectorType.c_mgmt');
  public localizedConnectorName = this.$translate.instant(`hercules.connectorNameFromConnectorType.${this.connectorType}`);
  public localizedContextManagementConnectorName = this.$translate.instant('hercules.connectorNameFromConnectorType.cs_mgmt');
  public localizedContextConnectorName = this.$translate.instant('hercules.connectorNameFromConnectorType.cs_context');
  public loading: boolean = true;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private FusionClusterService,
    private HybridServicesClusterStatesService: HybridServicesClusterStatesService,
    private Notification: Notification,
  ) {}

  public $onInit() {
    if (this.cluster) {
      this.FusionClusterService.get(this.cluster.id)
        .then(cluster => {
          this.hosts = this.FusionClusterService.buildSidepanelConnectorList(cluster, this.connectorType);
        })
        .catch((error) => {
          this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }

  public sortConnectors(connector): number {
    if (connector.connectorType === 'c_mgmt') {
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
