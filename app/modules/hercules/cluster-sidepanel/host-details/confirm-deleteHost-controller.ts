import { Notification } from 'modules/core/notifications';
interface IConfirmDeleteHostController {
  removeHost(): void;
}
export class ConfirmDeleteHostController implements IConfirmDeleteHostController {
  /* @ngInject */
  constructor(
    private ClusterService,
    private $modalInstance,
    private cluster: any,
    private Notification: Notification,
    private hostSerial: string,
    private $state: ng.ui.IStateService,
    private connectorType: string,
  ) {}

  public removeHost(): void {
    this.ClusterService.deleteHost(this.cluster.id, this.hostSerial)
      .then( () => {
          this.$modalInstance.close();
          if (this.connectorType === 'c_ucmc') {
            this.$state.go('call-service.list');
          }
          if (this.connectorType === 'c_cal') {
            this.$state.go('calendar-service.list');
          }
          this.Notification.success('hercules.deleteClusterNodeDialog.successNodeRemoval');
        },
      )
      .catch( (error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.deleteClusterNodeDialog.failedNodeRemoval');
      });
  }
}

angular
  .module('Hercules')
  .controller('ConfirmDeleteHostController', ConfirmDeleteHostController);
