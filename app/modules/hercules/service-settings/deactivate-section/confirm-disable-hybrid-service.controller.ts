import { Notification } from 'modules/core/notifications';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';

export class ConfirmDisableHybridServiceCtrl {

  public localizedServiceName: string = this.$translate.instant(`hercules.hybridServiceNames.${this.serviceId}`);
  public localizedConnectorName: string;
  public loading: boolean = false;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $modalInstance,
    private CloudConnectorService,
    private Notification: Notification,
    private ServiceDescriptorService: ServiceDescriptorService,
    public serviceId: HybridServiceId,
  ) {
    if (this.serviceId === 'squared-fusion-cal' || this.serviceId === 'squared-fusion-uc' || this.serviceId === 'spark-hybrid-impinterop') {
      this.localizedConnectorName = this.$translate.instant(`hercules.connectorNames.${this.serviceId}`);
    }
  }

  public confirmDeactivation = () => {
    this.loading = true;
    let disable = this.ServiceDescriptorService.disableService;
    if (this.serviceId === 'squared-fusion-gcal' || this.serviceId === 'squared-fusion-o365') {
      disable = this.CloudConnectorService.deactivateService;
    }
    disable(this.serviceId)
      .then(() => {
        this.Notification.success('hercules.deactivateServiceComponent.serviceWasDeactivated', {
          serviceName: this.localizedServiceName,
        });
        this.$modalInstance.close();
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        this.loading = false;
      });

  }

}

angular
  .module('Hercules')
  .controller('ConfirmDisableHybridServiceCtrl', ConfirmDisableHybridServiceCtrl);
