class CallerId implements ng.IComponentController {
  private onChangeFn: Function;
  private customCallerIdName: string;
  private customCallerIdNumber: string;
  private callerIdSelected: { label: string, value: Object };

  public $onInit(): void {

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

export class CallerIdConfig {
  public uuid: string;
  public name: string;
  public pattern: string;
  public externalCallerIdType: string;

  constructor(uuid: string, name: string, pattern: string, externalCallerIdType: string) {
    this.uuid = uuid;
    this.name = name;
    this.pattern = pattern;
    this.externalCallerIdType = externalCallerIdType;
  }
}

export class CallerIdOption {
  public label: string;
  public value: CallerIdConfig;

  constructor(label: string, callerIdConfig: CallerIdConfig) {
    this.label = label;
    this.value = callerIdConfig;
  }
}

export class CallerIdComponent implements ng.IComponentOptions {
  public controller = CallerId;
  public templateUrl = 'modules/huron/callerId/callerId.html';
  public bindings = <{ [binding: string]: string }>{
    callerIdOptions: '<',
    callerIdSelected: '<',
    customCallerIdName: '<',
    customCallerIdNumber: '<',
    onChangeFn: '&',
  };
}
