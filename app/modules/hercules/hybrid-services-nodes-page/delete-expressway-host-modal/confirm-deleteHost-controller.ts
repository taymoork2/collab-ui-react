import { Notification } from 'modules/core/notifications';
import { ConnectorType } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';

interface IConfirmDeleteHostController {
  removeHost(): void;
}
export class ConfirmDeleteHostController implements IConfirmDeleteHostController {
  /* @ngInject */
  constructor(
    private $modalInstance,
    private $state: ng.ui.IStateService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private connectorType: ConnectorType,
    private hostSerial: string,
    private Notification: Notification,
  ) {}

  public removeHost(): void {
    this.HybridServicesClusterService.purgeExpresswayHost(this.hostSerial)
      .then( () => {
        this.$modalInstance.close();
        if (this.connectorType === 'c_ucmc') {
          this.$state.go('call-service.list');
        }
        if (this.connectorType === 'c_cal') {
          this.$state.go('calendar-service.list');
        }
        this.Notification.success('hercules.deleteClusterNodeDialog.successNodeRemoval');
      })
      .catch( (error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.deleteClusterNodeDialog.failedNodeRemoval');
      });
  }
}

angular
  .module('Hercules')
  .controller('ConfirmDeleteHostController', ConfirmDeleteHostController);
