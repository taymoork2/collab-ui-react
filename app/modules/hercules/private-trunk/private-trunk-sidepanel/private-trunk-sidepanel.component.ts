import { EnterprisePrivateTrunkService, IDestination, IPrivateTrunkResourceWithStatus } from 'modules/hercules/services/enterprise-private-trunk-service';
import { IConnectorAlarm } from 'modules/hercules/hybrid-services.types';

class PrivateTrunkSidepanelComponentCtrl implements ng.IComponentController {

  public trunkId: string;
  public name: string;
  public address: string;
  public alarms: IConnectorAlarm[] = [];
  public destinations: IDestination[] = [];

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private EnterprisePrivateTrunkService: EnterprisePrivateTrunkService,
  ) {}

  public $onInit() {
    if (this.$state.current.data) {
      this.$state.current.data.displayName = this.$translate.instant('common.overview');
    }
    this.getData();
  }

  public getData(): void {
    if (this.trunkId) {
      this.$scope.$watch(() => {
        return this.EnterprisePrivateTrunkService.getTrunk(this.trunkId);
      }, (trunk: IPrivateTrunkResourceWithStatus) => {
        if (trunk) {
          this.name = trunk.name;
          this.address = trunk.address;
          if (trunk.status) {
            this.alarms = trunk.status.alarms;
            this.destinations = trunk.status.destinations;
          }
        }
      }, true);
    }
  }
}

export class PrivateTrunkSidepanelComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkSidepanelComponentCtrl;
  public template = require('modules/hercules/private-trunk/private-trunk-sidepanel/private-trunk-sidepanel.component.html');
  public bindings = {
    trunkId: '<',
  };
}
