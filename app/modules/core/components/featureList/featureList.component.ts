import './featureList.scss';

export interface IFeature {
  name: string;
  icon?: string;
  state?: string;
  detail?: string | undefined;
  actionAvailable?: boolean;
}

class FeatureListCtrl implements ng.IComponentController {
  public features: IFeature[];
  public onFeatureClick: Function;
  public hasOnFeatureClick: boolean = false;
  public hasActionAvailable: boolean = false;

  /* @ngInject */
  constructor(
    private $element: ng.IRootElementService,
    private $scope: ng.IScope,
  ) {}

  public action(feature: IFeature) {
    if (feature.actionAvailable) {
      this.onFeatureClick({
        feature: feature,
      });
    }
  }

  public $onInit() {
    this.$scope.$watchCollection(
      () => this.features,
      (features) => this.determineHasActionAvailable(features),
    );
  }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {
    const { features } = changes;
    if (features && features.currentValue) {
      this.determineHasActionAvailable(features.currentValue);
    }
  }

  private determineHasActionAvailable(features: IFeature[]): void {
    this.hasActionAvailable = _.some(features, 'actionAvailable');
  }

  public $postLink() {
    this.hasOnFeatureClick = Boolean(this.$element.attr('on-feature-click'));
  }
}

angular
  .module('Core')
  .component('featureList', {
    template: require('modules/core/components/featureList/featureList.tpl.html'),
    controller: FeatureListCtrl,
    bindings: {
      features: '<',
      onFeatureClick: '&',
    },
  });
