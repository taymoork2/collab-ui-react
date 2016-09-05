class CallerId {
  private onChangeFn: Function;
  private customCallerIdName: string;
  private customCallerIdNumber: string;
  private callerIdSelected: {label: string, value: Object};

  private $onInit(): void {

  }

  public onChange(): void {
    this.onChangeFn({
      callerIdSelected: this.callerIdSelected,
      customCallerIdName: this.customCallerIdName,
      customCallerIdNumber: this.customCallerIdNumber,
    });
  }

  public showCustom(): boolean {
    return this.callerIdSelected && this.callerIdSelected.label === 'Custom';
  }
}

export class CallerIdComponent implements ng.IComponentOptions {
  public controller = CallerId;
  public templateUrl = 'modules/huron/callerId/callerId.html';
  public bindings: {[binding: string]: string} = {
    callerIdOptions: '<',
    callerIdSelected: '<',
    customCallerIdName: '<',
    customCallerIdNumber: '<',
    onChangeFn: '&'
  }
}
