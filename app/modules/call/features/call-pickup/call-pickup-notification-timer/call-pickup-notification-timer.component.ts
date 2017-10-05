class CallPickupNotificationTimerCtrl implements ng.IComponentController {

  private MIN_SECONDS: number = 1;
  private MAX_SECONDS: number = 120;
  public onChangeFn: Function;
  public notificationTimer: number;
  public isError: boolean = false;
  public errorMessages = {};
  public piNotificationTimerForm: ng.IFormController;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {
    this.errorMessages = {
      min: this.$translate.instant('callPickup.notificationTimer.validation.error'),
      max: this.$translate.instant('callPickup.notificationTimer.validation.error'),
    };
  }
  public onNotificationTimerChange(): void {
    if (this.validate()) {
      this.isError = false;
      this.piNotificationTimerForm.$setValidity('', true, this.piNotificationTimerForm);
    } else {
      this.isError = true;
      this.piNotificationTimerForm.$setValidity('', false, this.piNotificationTimerForm);
    }
    this.onChangeFn({
      notificationTimer: this.notificationTimer,
    });
  }

  private validate(): boolean {
    return _.inRange(this.notificationTimer, this.MIN_SECONDS, this.MAX_SECONDS + 1);
  }
}

export class CallPickupNotificationTimerComponent implements ng.IComponentOptions {
  public controller = CallPickupNotificationTimerCtrl;
  public template = require('modules/call/features/call-pickup/call-pickup-notification-timer/call-pickup-notification-timer.component.html');
  public bindings = {
    notificationTimer: '<',
    onChangeFn: '&',
  };
}
