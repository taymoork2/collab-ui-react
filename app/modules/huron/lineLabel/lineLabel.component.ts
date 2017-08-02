class LineLabel implements ng.IComponentController {
  public lineLabelToggle: boolean;
  public lineLabel: string;
  public applyToAllSharedLines: boolean;
  public onChangeFn: Function;
  public showApplyToAllSharedLines: boolean;
  public disableCheckBox: boolean;

  /* @ngInject */
  constructor(
    private FeatureToggleService,
  ) {}

  public $onInit(): void {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1485)
      .then((result) => {
        this.lineLabelToggle = result;
      });
    this.applyToAllSharedLines ? this.disableCheckBox = true : this.disableCheckBox = false;
  }

  public onLineLabelChange(): void {
    this.change(this.lineLabel, this.applyToAllSharedLines);
  }

  private change(lineLabel: string, applyToAllSharedLines: boolean): void {
    this.onChangeFn({
      lineLabel: lineLabel,
      applyToAllSharedLines: applyToAllSharedLines,
    });
    this.disableCheckBox = false;
  }
}

export class LineLabelComponent implements ng.IComponentOptions {
  public controller = LineLabel;
  public templateUrl = 'modules/huron/lineLabel/lineLabel.html';
  public bindings = {
    onChangeFn: '&',
    lineLabel: '<',
    showApplyToAllSharedLines: '<',
    disableCheckBox: '=',
    applyToAllSharedLines: '=',
  };
}
