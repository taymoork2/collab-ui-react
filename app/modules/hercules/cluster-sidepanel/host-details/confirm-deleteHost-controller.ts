import { ClusterService } from 'modules/hercules/services/cluster-service';
import { Notification } from 'modules/core/notifications';
import { ICluster, ConnectorType } from 'modules/hercules/hybrid-services.types';

interface IConfirmDeleteHostController {
  removeHost(): void;
}
export class ConfirmDeleteHostController implements IConfirmDeleteHostController {
  /* @ngInject */
  constructor(
    private $modalInstance,
    private $state: ng.ui.IStateService,
    private cluster: ICluster,
    private ClusterService: ClusterService,
    private connectorType: ConnectorType,
    private hostSerial: string,
    private Notification: Notification,
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
      })
      .catch( (error) => {
        this.Notification.errorWithTrackingId(error, 'hercules.deleteClusterNodeDialog.failedNodeRemoval');
      });
  }
}

angular
  .module('Hercules')
  .controller('ConfirmDeleteHostController', ConfirmDeleteHostController);
