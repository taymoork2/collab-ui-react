class HuntGroupMaxWaitTimeCtrl implements ng.IComponentController {
  public maxWaitMins: string;
  public onChangeFn: Function;
  public options: number[] = [1, 2, 3];
  public isHuntGroupFallbackTimer: boolean;
  public isError: boolean;
  public errorMsg: string;

   /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {
  }

  public $onInit(): void {
    this.isError = false;
    this.errorMsg = this.$translate.instant('callPark.fallbackTimer.validation.error', {
      min: this.options[0],
      max: this.options[this.options.length - 1],
    });
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { maxWaitMins, options } = changes;

    if (maxWaitMins && maxWaitMins.currentValue && this.validate(maxWaitMins.currentValue)) {
      this.maxWaitMins = maxWaitMins.currentValue;
      this.isError = false;
    }
    if (options && options.currentValue) {
      this.options = options.currentValue;
    }

  }

  public onMaxWaitMinsChange(minutes: number): void {
    if (this.validate(minutes)) {
      this.isError = false;
    } else {
      this.isError = true;
    }
    this.onChangeFn({
      minutes: minutes,
    });
  }

  private validate(minutes: number): boolean {
    return _.inRange(minutes, this.options[0], this.options[this.options.length - 1] + 1);
  }

}

export class HuntGroupMaxWaitTimeComponent implements ng.IComponentOptions {
  public controller = HuntGroupMaxWaitTimeCtrl;
  public template = require('modules/call/features/hunt-group/hunt-group-max-wait-time/hunt-group-max-wait-time.component.html');
  public bindings = {
    maxWaitMins: '<',
    options: '<',
    isHuntGroupFallbackTimer: '<',
    onChangeFn: '&',
  };
}
