import { PrivateTrunkDomainService } from 'modules/hercules/privateTrunk/privateTrunkDomain';

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
   private PrivateTrunkDomainService: PrivateTrunkDomainService,
  ) {
  }

  public $onInit(): void {
    this.PrivateTrunkDomainService.openModal();
  }
}

export class PrivateTrunkOverviewComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkOverviewCtrl;
  public templateUrl = 'modules/hercules/privateTrunk/privateTrunkOverview/privateTrunkOverview.html';
  public bindings = {
    hasPrivateTrunkFeatureToggle: '<',
  };
}
