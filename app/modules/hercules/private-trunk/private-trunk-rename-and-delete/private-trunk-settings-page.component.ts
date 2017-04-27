interface IFakeFMSCluster {
  name: string;
  id: string;
  targetType: string;
}

import { EnterprisePrivateTrunkService, IPrivateTrunkResource } from 'modules/hercules/services/enterprise-private-trunk-service';

class PrivateTrunkSettingsPageComponentCtrl implements ng.IComponentController {

  public trunkId: string;
  public backState = 'cluster-list';
  public cluster: IFakeFMSCluster;

  /* @ngInject */
  constructor(
    private EnterprisePrivateTrunkService: EnterprisePrivateTrunkService,
  ) {}

  public $onInit() {
    this.cluster = {
      name: '',
      id: this.trunkId,
      targetType: 'ept',
    };

    this.EnterprisePrivateTrunkService.getTrunkFromCmi(this.trunkId)
      .then((trunk: IPrivateTrunkResource) => {
        this.cluster.name = trunk.name;
      });
  }

  public nameUpdated(name: string) {
    this.cluster.name = name;
  }

}


export class PrivateTrunkSettingsPageComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkSettingsPageComponentCtrl;
  public templateUrl = 'modules/hercules/private-trunk/private-trunk-rename-and-delete/private-trunk-settings-page.component.html';
  public bindings = {
    trunkId: '<',
  };
}
