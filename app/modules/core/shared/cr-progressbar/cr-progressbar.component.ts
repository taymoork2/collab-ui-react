import './cr-progressbar.scss';

class CrProgressbarController implements ng.IComponentController {
  public progressbarLabel?: string;
  public progressbarType?: string;
  public progressbarValue: number;
  public progressbarMax?: number;
  public progressbarFilename?: string;
  public progressbarIsProcessing: boolean;
  public progressbarOnCancel?: Function;

  private readonly DEFAULT_TYPE = 'primary';
  private readonly DEFAULT_MAX = 100;
  private PROCESSING_LABEL?: string;
  private COMPLETED_LABEL?: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit() {
    this.PROCESSING_LABEL = this.$translate.instant('common.processingEllipsis');
    this.COMPLETED_LABEL = this.$translate.instant('common.completed');
  }

  public get type() {
    return this.progressbarType || this.DEFAULT_TYPE;
  }

  public get max() {
    return this.progressbarMax || this.DEFAULT_MAX;
  }

  public get label() {
    if (this.progressbarLabel) {
      return this.progressbarLabel;
    }
    if (this.progressbarIsProcessing) {
      return this.PROCESSING_LABEL;
    }
    if (this.progressbarValue === this.max) {
      return this.COMPLETED_LABEL;
    }
  }

  public get progress() {
    if (_.isUndefined(this.progressbarValue)) {
      return '0%';
    }
    const progressPercentage = Math.round(this.progressbarValue / this.max * 100);
    return `${progressPercentage}%`;
  }

  public get canCancel() {
    return _.isFunction(this.progressbarOnCancel) && this.progressbarIsProcessing;
  }

  public cancel() {
    if (_.isFunction(this.progressbarOnCancel)) {
      this.progressbarOnCancel();
    }
  }
}

export class CrProgressbarComponent implements ng.IComponentOptions {
  public controller = CrProgressbarController;
  public template = require('./cr-progressbar.html');
  public bindings = {
    progressbarLabel: '<?',
    progressbarType: '@?',
    progressbarValue: '<',
    progressbarMax: '<',
    progressbarFilename: '<?',
    progressbarIsProcessing: '<',
    progressbarOnCancel: '&?',
  };
}
