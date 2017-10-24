class LinkedSitesComponentCtrl implements ng.IComponentController {
  public ready;

  /* @ngInject */
  constructor(
    private FeatureToggleService,

) {}

  public $onInit = () => {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasAccountLinkingPhase2).then( (feature) => {
      this.ready = feature;
    });
  }

}

export class LinkedSitesComponent implements ng.IComponentOptions {

  /* @ngInject */
  constructor() {
  }

  public controller = LinkedSitesComponentCtrl;
  public template = require('./linked-sites.component.html');
  public bindings = { };
}
