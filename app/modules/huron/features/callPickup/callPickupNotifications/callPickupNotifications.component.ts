class CallPickupNotificationsCtrl implements ng.IComponentController {
  public onChangeFn: Function;
  private playSound: boolean;
  private displayCallingParty;
  private displayCalledParty;
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
  public templateUrl = 'modules/huron/features/callPickup/callPickupNotifications/callPickupNotifications.html';
  public bindings = {
    onChangeFn: '&',
    displayCalledParty: '<',
    displayCallingParty: '<',
    playSound: '<',
  };
}
