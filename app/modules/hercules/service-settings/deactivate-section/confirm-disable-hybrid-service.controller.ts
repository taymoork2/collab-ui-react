import { USSService } from 'modules/hercules/services/uss.service';
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
    private USSService: USSService,
    public serviceId: HybridServiceId,
  ) {
    if (this.serviceId === 'squared-fusion-cal' || this.serviceId === 'squared-fusion-uc' || this.serviceId === 'spark-hybrid-impinterop') {
      this.localizedConnectorName = this.$translate.instant(`hercules.connectorNames.${this.serviceId}`);
    }
  }

  public confirmDeactivation = () => {
    this.loading = true;
    if (this.serviceId === 'squared-fusion-o365') {
      this.USSService.resetOwnershipForAllUsers()
        .catch((error) => {
          if (error && error.status === 502) {
            // "Retry" because 502 from this API means that the server was doing
            // its job of moving users but couldn't finish before an internal timeout.
            return this.confirmDeactivation();
          }
          this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
          this.loading = false;
          throw new Error(error);
        })
        .then(this.disable);
    } else {
      this.disable();
    }
  }

  private disable = () => {
    let disableMethod = this.ServiceDescriptorService.disableService;
    if (this.serviceId === 'squared-fusion-gcal' || this.serviceId === 'squared-fusion-o365') {
      disableMethod = this.CloudConnectorService.deactivateService;
    }
    return disableMethod(this.serviceId)
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
