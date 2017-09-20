class CallPickupNotificationsCtrl implements ng.IComponentController {
  public onChangeFn: Function;
  private playSound: boolean;
  private displayCallingParty;
  private displayCalledParty;

  /* @ngInject */
  constructor() { }

  public onChange(): void {
    this.onChangeFn({
      playSound: this.playSound,
      displayCalledParty: this.displayCalledParty,
      displayCallingParty: this.displayCallingParty,
    });
  }
}

export class CallPickupNotificationsComponent implements ng.IComponentOptions {
  public controller = CallPickupNotificationsCtrl;
  public template = require('modules/call/features/call-pickup/call-pickup-notifications/call-pickup-notifications.component.html');
  public bindings = {
    onChangeFn: '&',
    displayCalledParty: '<',
    displayCallingParty: '<',
    playSound: '<',
  };
}
