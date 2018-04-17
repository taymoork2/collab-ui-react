import { Line } from 'modules/huron/lines/services';

class SnrLinesCtrl implements ng.IComponentController {

  public lines: Line[];
  public patterns: string[];
  public uuid: boolean;
  public onChangeFn: Function;
  public snrLinesForm: ng.IFormController;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { lines, patterns, uuid } = changes;

    if (lines && lines.currentValue) {
      this.processLines();
    }

    if (patterns && patterns.currentValue) {
      if (this.snrLinesForm) {
        this.snrLinesForm.$setValidity('', patterns.currentValue.length > 0, this.snrLinesForm);
      }
    }

    if (uuid) {
      if (!uuid.currentValue) {
        this.enableAllLines();
      }
    }
  }

  private enableAllLines() {
    _.forEach(this.lines, line => {
      this.patterns.push(line.internal);
    });
    this.processLines();
  }

  private processLines() {
    _.map(this.lines, (line: Line) => {
      return _.set(line, 'value', this.checkLineStatus(line.internal));
    });
  }

  public formatLineLabel(line: Line): string {
    if (line.primary) {
      return `${line.internal} - ${this.$translate.instant('common.primary')}`;
    } else if (line.shared) {
      return `${line.internal} - ${this.$translate.instant('common.shared')}`;
    } else {
      return line.internal;
    }
  }

  public onLineChange(line): void {
    if (line.value) {
      this.onChange(_.concat(this.patterns, line.internal));
    } else {
      this.onChange(_.without(this.patterns, line.internal));
    }
  }

  private checkLineStatus(internalLine: string): boolean {
    return (_.indexOf(this.patterns, internalLine) > -1) ? true : false;
  }

  private onChange(patterns: string[]) {
    this.onChangeFn({
      patterns: patterns,
    });
  }

}

export class SnrLinesComponent implements ng.IComponentOptions {
  public controller = SnrLinesCtrl;
  public template = require('./snr-lines.component.html');
  public bindings = {
    lines: '<',
    patterns: '<',
    uuid: '<',
    onChangeFn: '&',
  };
}
