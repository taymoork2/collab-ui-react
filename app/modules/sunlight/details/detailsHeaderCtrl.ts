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

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private FeatureToggleService,
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

export class DetailsHeaderComponent implements ng.IComponentOptions {
  public controller = DetailsHeaderCtrl;
  public template = require('modules/sunlight/details/detailsHeader.tpl.html');
  public bindings = {};
}
