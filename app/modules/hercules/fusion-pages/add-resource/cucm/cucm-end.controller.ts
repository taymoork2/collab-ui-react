export class CucmEndController {

  /* @ngInject */
  constructor(
    private $stateParams: ng.ui.IStateParamsService,
    private $window: ng.IWindowService,
  ) {
  }

  public next() {
    let hostname = this.$stateParams.wizard.state().data.cucm.hostname;
    this.$window.open('https://' + encodeURIComponent(hostname) + '/ccmadmin/fusionRegistration.do');
  }
}

angular
  .module('Hercules')
  .controller('CucmEndController', CucmEndController);
