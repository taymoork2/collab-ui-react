
export class SparkAssistantSettingController {
  public hasSparkAssistantToggle: boolean = false;
  public ftsw: boolean;
  public value: boolean;
  public label: string;
  /* @ngInject */
  constructor(
    private FeatureToggleService,
    private $translate: ng.translate.ITranslateService,

  ) {
    this.FeatureToggleService.supports(FeatureToggleService.features.sparkAssistant).then(supports => {
      this.hasSparkAssistantToggle = supports;
    });
  }

  public $onInit() {
    this.value = this.ftsw;
    this.setInputLabel();
  }

  public setInputLabel(): void {
    this.label = this.ftsw ? this.$translate.instant('globalSettings.sparkAssistant.subsectionLabel') : this.$translate.instant('globalSettings.sparkAssistant.description');
  }

  public onChange(toggleValue) {
    this.hasSparkAssistantToggle = !toggleValue;
  }
}
