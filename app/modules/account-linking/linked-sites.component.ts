class LinkedSitesComponentCtrl implements ng.IComponentController {
  public ready;

  /* @ngInject */
  constructor(
    private FeatureToggleService,

) {}

  public $onInit = () => {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasAccountLinkingPhase2).then( (feature) => {
      if (feature === false) {
        this.ready = false;
      } else {
        this.ready = true;
      }
    });
  }

}

export class LinkedSitesComponent implements ng.IComponentOptions {

  /* @ngInject */
  constructor() {
  }

  public controller = LinkedSitesComponentCtrl;
  public template = require('modules/account-linking/linked-sites.component.html');
  public bindings = { };
}
