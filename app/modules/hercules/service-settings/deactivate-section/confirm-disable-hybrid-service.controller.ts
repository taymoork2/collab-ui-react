import { Notification } from '../../../core/notifications/notification.service';

export class ConfirmDisableHybridServiceCtrl {

  public localizedServiceName: string = this.$translate.instant(`hercules.hybridServiceNames.${this.serviceId}`);
  public loading: boolean = false;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $modalInstance,
    private CloudConnectorService,
    private Notification: Notification,
    private ServiceDescriptor,
    private serviceId: string,
  ) {}

  public confirmDeactivation = () => {
    this.loading = true;
    let disable = this.ServiceDescriptor.disableService;
    if (this.serviceId === 'squared-fusion-gcal') {
      disable = this.CloudConnectorService.deactivateService;
    }
    disable(this.serviceId)
      .then(() => {
        this.Notification.success(this.$translate.instant('hercules.deactivateServiceComponent.serviceWasDeactivated', {
          serviceName: this.localizedServiceName,
        }));
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
