import { PrivateTrunkPrereqService } from 'modules/hercules/private-trunk/prereq';

export class PrivateTrunkOverviewCtrl implements ng.IComponentController {
  public back: boolean = true;
  public backState = 'services-overview';
  public hasPrivateTrunkFeatureToggle: boolean;
  public tabs = [{
    title: 'Resources',
    state: 'private-trunk-overview.list',
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
  public templateUrl = 'modules/hercules/private-trunk/overview/private-trunk-overview.html';
  public bindings = {
    hasPrivateTrunkFeatureToggle: '<',
  };
}
