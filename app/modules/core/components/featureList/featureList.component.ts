export interface IFeature {
  name: string;
  icon: string;
  state: string;
  detail: string;
  actionsAvailable: boolean;
}

class FeatureListCtrl implements ng.IComponentController {
  public featureActions: Function;
  public action(feature) {
    this.featureActions({
      feature: feature.state,
    });
  }
}

angular
  .module('Core')
  .component('featureList', {
    templateUrl: 'modules/core/components/featureList/featureList.tpl.html',
    controller: FeatureListCtrl,
    bindings: {
      features: '<',
      featureActions: '&',
    },
  });
