class CallPickupNameCtrl implements ng.IComponentController {
  public callPickupName: string;
  public errorNameInput: boolean = false;
  private onUpdate: Function;

  public onChange(): void {
    let reg = /^$|^[A-Za-z\-\_\d\s]+$/;
    this.errorNameInput = !reg.test(this.callPickupName);
    this.onUpdate({
      name: this.callPickupName,
      isValid: !this.errorNameInput,
    });
  }
}

export class CallPickupNameComponent implements ng.IComponentOptions {
  public controller = CallPickupNameCtrl;
  public templateUrl = 'modules/huron/features/callPickup/callPickupSetupAssistant/callPickupName/callPickupName.html';
  public bindings = {
    onUpdate: '&',
    callPickupName: '<',
  };
}
