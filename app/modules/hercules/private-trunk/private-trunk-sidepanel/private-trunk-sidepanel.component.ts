import { EnterprisePrivateTrunkService, ITrunkFromFms, IDestination } from 'modules/hercules/services/enterprise-private-trunk-service';
import { Notification } from 'modules/core/notifications';
import { IConnectorAlarm } from 'modules/hercules/hybrid-services.types';

class PrivateTrunkSidepanelComponentCtrl implements ng.IComponentController {

  private trunkId: string;
  public name: string;
  public address: string;
  public alarms: IConnectorAlarm[] = [];
  public destinations: IDestination[] = [];

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private EnterprisePrivateTrunkService: EnterprisePrivateTrunkService,
    private Notification: Notification,
  ) {}

  public $onInit() {
    this.$state.current.data.displayName = this.$translate.instant('common.overview');
    this.getData();
  }

  public getData(): void {
    this.EnterprisePrivateTrunkService.getTrunkFromFMS(this.trunkId)
      .then((trunk: ITrunkFromFms) => {
        if (trunk) {
          this.alarms = trunk.alarms;
          this.destinations = trunk.destinations;
        }
      })
      .catch(error => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      });
    this.EnterprisePrivateTrunkService.getTrunkFromCmi(this.trunkId)
      .then((trunk) => {
        this.name = trunk.name;
        this.address = trunk.address;
      })
      .catch(error => {
        this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
      });
  }

}

export class PrivateTrunkSidepanelComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkSidepanelComponentCtrl;
  public templateUrl = 'modules/hercules/private-trunk/private-trunk-sidepanel/private-trunk-sidepanel.component.html';
  public bindings = {
    trunkId: '<',
  };
}
