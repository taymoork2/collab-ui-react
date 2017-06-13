export class CucmEndController {
  public nameChangeEnabled: boolean = false;

  /* @ngInject */
  constructor(
    private $stateParams: ng.ui.IStateParamsService,
    private $window: ng.IWindowService,
    private FeatureToggleService,
  ) {
    this.FeatureToggleService.atlas2017NameChangeGetStatus().then((toggle: boolean): void => {
      this.nameChangeEnabled = toggle;
    });
  }

  public next() {
    let hostname = this.$stateParams.wizard.state().data.cucm.hostname;
    this.$window.open('https://' + encodeURIComponent(hostname) + '/ccmadmin/fusionRegistration.do');
  }
}

angular
  .module('Hercules')
  .controller('CucmEndController', CucmEndController);
