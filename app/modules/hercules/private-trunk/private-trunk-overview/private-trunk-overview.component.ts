export class PrivateTrunkOverviewCtrl implements ng.IComponentController {

  public back: boolean = true;
  public backState = 'services-overview';
  public hasPrivateTrunkFeatureToggle: boolean;
  public tabs = [{
    title: 'Resources',
    state: 'private-trunk-overview.list',
  }, {
    title: 'Settings',
    state: 'private-trunk-overview.settings',
  }];

  /* @ngInject */
  constructor (
    private $state: ng.ui.IStateService,
  ) {
  }

  public $onInit(): void {
    if (!this.hasPrivateTrunkFeatureToggle) {
      this.$state.go(this.backState);
    }
  }

  public getModalOptions() {
    const currentStep: number = 2;
    let addResourceModalOptions = {
      template: '<private-trunk-setup class="modal-content" currentStepIndex=' + currentStep + '></private-trunk-setup>',
      type: 'full',
      keyboard: false,
    };
    return addResourceModalOptions;
  }

}

export class PrivateTrunkOverviewComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkOverviewCtrl;
  public templateUrl = 'modules/hercules/private-trunk/private-trunk-overview/private-trunk-overview.html';
  public bindings = {
    hasPrivateTrunkFeatureToggle: '<',
  };
}
