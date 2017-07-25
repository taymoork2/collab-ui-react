import { Notification } from 'modules/core/notifications';

export class DeactivateServiceOnExpresswayModalController implements ng.IComponentController {
  /* @ngInject */
  constructor(
    private $modalInstance,
    private $translate: ng.translate.ITranslateService,
    private HybridServicesUtilsService,
    private HybridServicesClusterService,
    private Notification: Notification,
    private serviceId,
    public clusterId,
    public clusterName,
  ) {}

  public localizedConnectorName: string = this.$translate.instant('hercules.connectorNameFromConnectorType.' + this.serviceId);
  public localizedServiceName: string = this.$translate.instant('hercules.serviceNameFromConnectorType.' + this.serviceId);
  public loading: boolean = false;

  public deactivateService() {
    this.loading = true;
    this.HybridServicesClusterService.deprovisionConnector(this.clusterId, this.serviceId)
      .then(this.$modalInstance.close)
      .catch((error: any): void => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      })
      .finally((): void => {
        this.loading = false;
      });
  }

  public getIconClassForService() {
    return this.HybridServicesUtilsService.serviceId2Icon(this.HybridServicesUtilsService.connectorType2ServicesId(this.serviceId)[0]);
  }
}

export default angular
  .module('Hercules')
  .controller('DeactivateServiceOnExpresswayModalController', DeactivateServiceOnExpresswayModalController)
  .name;

