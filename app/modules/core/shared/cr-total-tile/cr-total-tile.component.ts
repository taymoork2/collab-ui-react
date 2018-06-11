export class CrTotalTileController implements ng.IComponentController {
  public l10nLabel?: string;
  public totalColor?: string;
  public totalLabel?: string;
  public totalValue: string;

  private translatedLabel?: string;

  private readonly DEFAULT_COLOR = 'blue';
  private readonly DISABLED_COLOR_CLASS = 'total-tile__value--disabled';
  private readonly VALUE_CLASS = 'total-tile__value';

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit() {
    if (this.l10nLabel) {
      this.translatedLabel = this.$translate.instant(this.l10nLabel, { total: this.totalValue }, 'messageformat');
    }
  }

  public get totalLabelText(): string {
    return this.translatedLabel || this.totalLabel || '';
  }

  public get totalValueColorClass(): string {
    if (_.parseInt(this.totalValue) === 0) {
      return this.DISABLED_COLOR_CLASS;
    }
    const color = this.totalColor || this.DEFAULT_COLOR;
    return `${this.VALUE_CLASS}--${color}`;
  }
}

export class CrTotalTileComponent implements ng.IComponentOptions {
  public controller = CrTotalTileController;
  public template = require('./cr-total-tile.html');
  public bindings = {
    l10nLabel: '@?',
    totalColor: '@?',
    totalLabel: '@?',
    totalValue: '<',
  };
}
