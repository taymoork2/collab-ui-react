import { PrivateTrunkPrereqService } from 'modules/hercules/privateTrunk/privateTrunkPrereq';

export class PrivateTrunkOverviewCtrl implements ng.IComponentController {
  public back: boolean = true;
  public backState = 'services-overview';
  public hasPrivateTrunkFeatureToggle: boolean;
  public tabs = [{
    title: 'Resources',
    state: 'private-trunk-setup',
  }, {
    title: 'Settings',
    state: 'test',
  }];

  /* @ngInject */
  constructor(
    private PrivateTrunkPrereqService: PrivateTrunkPrereqService,
  ) {
  }

  public $onInit(): void {
    if (this.hasPrivateTrunkFeatureToggle) {
      this.PrivateTrunkPrereqService.openSetupModal();
    }
  }
}

export class PrivateTrunkOverviewComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkOverviewCtrl;
  public templateUrl = 'modules/hercules/privateTrunk/privateTrunkOverview/private-trunk-overview.html';
  public bindings = {
    hasPrivateTrunkFeatureToggle: '<',
  };
}
