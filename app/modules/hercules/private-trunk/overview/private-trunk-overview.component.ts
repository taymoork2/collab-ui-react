export class PrivateTrunkOverviewCtrl implements ng.IComponentController {
  public back: boolean = true;
  public backState = 'services-overview';
  public hasPrivateTrunkFeatureToggle: boolean;
  public tabs = [{
    title: 'Resources',
    state: 'private-trunk-overview.list',
  }, {
    title: 'Settings',
    state: '404',
  }];

  /* @ngInject */
  constructor(
    private $state,
  ) {
  }

  public $onInit(): void {
    if (!this.hasPrivateTrunkFeatureToggle) {
      this.$state.go(this.backState);
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
