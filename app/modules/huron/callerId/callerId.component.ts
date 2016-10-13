import { CallerIDService } from './callerId.service';
class CallerId implements ng.IComponentController {
  private onChangeFn: Function;
  private customCallerIdName: string;
  private customCallerIdNumber: string;
  private callerIdSelected: CallerIdOption;
  private callerIdOptions: CallerIdOption[];
  private directLine;

  /* @ngInject */
  constructor(private CallerIDService: CallerIDService) {}

  public $onInit(): void {
    this.CallerIDService.initCallerId(this.directLine).then((data) => {
      this.callerIdOptions = data;
    });
  }

  public $onChanges(changes) {
    if (changes.directLine && changes.directLine.currentValue !== null) {
      let data = this.CallerIDService.changeDirectLine(changes.directLine.currentValue, this.callerIdSelected);
      this.callerIdOptions = data.options;
      this.callerIdSelected = data.selected;
    }
    if (changes.externalType) {
      this.callerIdSelected = this.CallerIDService.selectType(changes.externalType.currentValue);
    }
  }

  public onChange(): void {
    this.onChangeFn({
      callerIdSelected: this.callerIdSelected,
      customCallerIdName: this.customCallerIdName,
      customCallerIdNumber: this.customCallerIdNumber,
    });
  }

  public showCustom(): boolean {
    return this.CallerIDService.isCustom(this.callerIdSelected);
  }
}

export class CallerIdConfig {
  public uuid: string;
  public name: string;
  public pattern: string | null | undefined;
  public externalCallerIdType: string;

  constructor(uuid: string, name: string, pattern: string | null | undefined, externalCallerIdType: string) {
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
    directLine: '<',
    externalType: '<',
    onChangeFn: '&',
  };
}
