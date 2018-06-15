interface IFakeFMSCluster {
  name: string;
  id: string;
  targetType: string;
}

import { EnterprisePrivateTrunkService, IPrivateTrunkResourceWithStatus } from 'modules/hercules/services/enterprise-private-trunk-service';

class PrivateTrunkSettingsPageComponentCtrl implements ng.IComponentController {

  public trunkId: string;
  public backState = 'cluster-list';
  public cluster: IFakeFMSCluster;

  /* @ngInject */
  constructor(
    private EnterprisePrivateTrunkService: EnterprisePrivateTrunkService,
  ) {}

  public $onInit() {
    this.EnterprisePrivateTrunkService.getTrunkFromCmi(this.trunkId)
      .then((trunk: IPrivateTrunkResourceWithStatus) => {
        this.cluster = {
          name: trunk.name,
          id: this.trunkId,
          targetType: 'ept',
        };
      });
  }

  public nameUpdated(name: string) {
    this.cluster.name = name;
  }

}

export class PrivateTrunkSettingsPageComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkSettingsPageComponentCtrl;
  public template = require('modules/hercules/private-trunk/private-trunk-rename-and-delete/private-trunk-settings-page.component.html');
  public bindings = {
    trunkId: '<',
  };
}
