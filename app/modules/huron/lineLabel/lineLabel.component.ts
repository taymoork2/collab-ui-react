class LineLabel implements ng.IComponentController {
  public lineLabel: string;
  public applyToAllSharedLines: boolean;
  public onChangeFn: Function;
  public showApplyToAllSharedLines: boolean;

  public $onInit(): void {
    this.applyToAllSharedLines = false;
  }

  public onLineLabelChange(): void {
    this.change(this.lineLabel, this.applyToAllSharedLines);
  }

  private change(lineLabel: string, applyToAllSharedLines: boolean): void {
    this.onChangeFn({
      lineLabel: lineLabel,
      applyToAllSharedLines: applyToAllSharedLines,
    });
  }
}

export class LineLabelComponent implements ng.IComponentOptions {
  public controller = LineLabel;
  public template = require('modules/huron/lineLabel/lineLabel.html');
  public bindings = {
    onChangeFn: '&',
    lineLabel: '<',
    showApplyToAllSharedLines: '<',
    applyToAllSharedLines: '=',
  };
}
