class CallParkReversionTimerCtrl implements ng.IComponentController {
  private MIN_SECONDS: number = 30;
  private MAX_SECONDS: number = 900;

  public fallbackTimer: number;
  public onChangeFn: Function;

  public cpReversionTimerForm: ng.IFormController;
  public options: number[] = [30, 45, 60, 120, 180, 300, 600, 900];
  public isError: boolean = false;
  public errorMsg: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {
    this.errorMsg = this.$translate.instant('callPark.fallbackTimer.validation.error', {
      min: this.MIN_SECONDS,
      max: this.MAX_SECONDS,
    });
  }

  public onFallbackTimerChange(seconds: number): void {
    if (this.validate(seconds)) {
      this.isError = false;
      this.cpReversionTimerForm.$setValidity('', true, this.cpReversionTimerForm);
    } else {
      this.isError = true;
      this.cpReversionTimerForm.$setValidity('', false, this.cpReversionTimerForm);
    }
    this.onChangeFn({
      seconds: seconds,
    });
  }

  private validate(seconds: number): boolean {
    return _.inRange(seconds, this.MIN_SECONDS, this.MAX_SECONDS + 1);
  }
}

export class CallParkReversionTimerComponent implements ng.IComponentOptions {
  public controller = CallParkReversionTimerCtrl;
  public template = require('modules/call/features/call-park/call-park-reversion-timer/call-park-reversion-timer.component.html');
  public bindings = {
    fallbackTimer: '<',
    onChangeFn: '&',
  };
}
