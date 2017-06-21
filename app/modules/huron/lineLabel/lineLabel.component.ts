class LineLabel implements ng.IComponentController {
  public lineLabelToggle: boolean;
  public lineLabel: string;

  /* @ngInject */
  constructor(
    private FeatureToggleService,
  ) {}

  public $onInit(): void {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1485)
      .then((result) => {
        this.lineLabelToggle = result;
      });
  }
}

export class LineLabelComponent implements ng.IComponentOptions {
  public controller = LineLabel;
  public templateUrl = 'modules/huron/lineLabel/lineLabel.html';
  public bindings = {
    lineLabel: '<',
  };
}
