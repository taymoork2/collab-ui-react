import { CallerIDService } from './callerId.service';
import { IOption } from './../dialing/dialing.service';
class CallerId implements ng.IComponentController {
  private onChangeFn: Function;
  private customCallerIdName: string | null;
  private customCallerIdNumber: string | null;
  private callerIdSelected: IOption;
  private callerIdOptions: IOption[];

  /* @ngInject */
  constructor(private CallerIDService: CallerIDService) {}

  public $onInit(): void {

  }

  public $onChanges(changes) {
    if (changes.directLine && (typeof changes.directLine.previousValue !== 'object' || changes.directLine.previousValue === null)) {
      let data = this.CallerIDService.changeDirectLine(<string>_.get(changes, 'directLine.currentValue'), this.callerIdSelected);
      this.callerIdOptions = data.options;
      this.callerIdSelected = data.selected;
      this.onChange();
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

  public getSelected(selected) {
    return this.CallerIDService.getSelected(selected);
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
    onChangeFn: '&',
  };
}
