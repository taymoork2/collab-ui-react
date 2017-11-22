import NotificationModuleName, { Notification } from 'modules/core/notifications';
import { ConnectorType } from 'modules/hercules/hybrid-services.types';
import HybridServicesClusterServiceModuleName, { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';

export class DeactivateServiceOnExpresswayModalController implements ng.IComponentController {

  /* @ngInject */
  constructor(
    private $modalInstance: ng.ui.bootstrap.IModalInstanceService,
    private $translate: ng.translate.ITranslateService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private Notification: Notification,
    private connectorType: ConnectorType,
    public clusterId: string,
    public clusterName: string,
  ) {
    this.init();
  }

  public localizedConnectorName: string = this.$translate.instant('hercules.connectorNameFromConnectorType.' + this.connectorType);
  public localizedServiceName: string = this.$translate.instant('hercules.serviceNameFromConnectorType.' + this.connectorType);
  public loading: boolean = false;
  public isLastClusterInOrg = false;
  public hasCheckedWarning = false;

  private init() {
    this.HybridServicesClusterService.hasOnlyOneExpresswayWithConnectorProvisioned(this.connectorType)
      .then((isLast) => {
        this.isLastClusterInOrg = isLast;
      });
  }

  public deactivateService() {
    this.loading = true;
    this.HybridServicesClusterService.deprovisionConnector(this.clusterId, this.connectorType)
      .then(this.$modalInstance.close)
      .catch((error: any): void => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      })
      .finally((): void => {
        this.loading = false;
      });
  }

}

export default angular
  .module('hercules.deactivate-service-on-expressway', [
    require('angular-translate'),
    HybridServicesClusterServiceModuleName,
    NotificationModuleName,
  ])
  .controller('DeactivateServiceOnExpresswayModalController', DeactivateServiceOnExpresswayModalController)
  .name;

