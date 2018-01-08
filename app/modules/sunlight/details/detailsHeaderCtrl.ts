import { FeatureToggleService } from 'modules/core/featureToggle';

class Tab {
  public title: string;
  public state: string;

  constructor(title: string, state: string) {
    this.title = title;
    this.state = state;
  }
}

class DetailsHeaderCtrl implements ng.IComponentController {
  public back: boolean = false;
  public tabs: Tab[] = [];

  constructor(
    private $translate: ng.translate.ITranslateService,
    private FeatureToggleService: FeatureToggleService,
  ) {}

  public $onInit() {
    this.tabs.push(new Tab(this.$translate.instant('sunlightDetails.featuresTitle'), 'care.Features'));
    this.tabs.push(new Tab(this.$translate.instant('sunlightDetails.settingsTitle'), 'care.Settings'));
    this.FeatureToggleService.supports(this.FeatureToggleService.features.hybridCare).then(supports => {
      if (supports) {
        this.tabs.splice(0, 0, new Tab(this.$translate.instant('sunlightDetails.numberTitle'), 'care.numbers'));
      }
    });
  }
}

export default angular
  .module('CareDetails')
  .controller('DetailsHeaderCtrl', DetailsHeaderCtrl);
