import { AccessibilityService } from 'modules/core/accessibility';
import { CallParkService, ICallParkRangeItem } from 'modules/call/features/call-park';

export enum RangeType {
  RANGE = <any>'range',
  SINGLE = <any>'single',
}

export enum RangeFieldName {
  SINGLE_NUMBER = <any>'singleNumber',
  START_RANGE = <any>'startRange',
  END_RANGE = <any>'endRange',
}

class CallParkNumberCtrl implements ng.IComponentController {

  public range: ICallParkRangeItem;
  public location;
  public extensionLength: string;
  public onChangeFn: Function;
  public onKeyPressFn: Function;
  public setFocus: boolean;

  public form: ng.IFormController;
  public rangeType: RangeType = RangeType.RANGE;
  public singleNumber: string;
  public startRange: string;
  public endRange: string;
  public errorEndRangeInput: boolean = false;
  public errorSingleNumberInput: boolean = false;

  /* @ngInject */
  constructor(
    private $element: ng.IRootElementService,
    private AccessibilityService: AccessibilityService,
    private CallParkService: CallParkService,
  ) {}

  public $onInit() {
    if (this.setFocus) {
      this.AccessibilityService.setFocus(this.$element, '[name="startRange"]', 100);
    }
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { range } = changes;
    if (range && range.currentValue) {
      this.processCallParkNumberChanges(range);
    }
  }

  private processCallParkNumberChanges(callParkChanges: ng.IChangesObject<any>): void {
    if (_.isEqual(callParkChanges.currentValue.startRange, callParkChanges.currentValue.endRange) && callParkChanges.currentValue.startRange !== '') {
      this.rangeType = RangeType.SINGLE;
      this.singleNumber = callParkChanges.currentValue.startRange;
      this.startRange = '';
      this.endRange = '';
    } else {
      this.rangeType = RangeType.RANGE;
      this.startRange = callParkChanges.currentValue.startRange;
      this.endRange = callParkChanges.currentValue.endRange;
      this.singleNumber = '';
    }
  }

  public getRangeList(): ng.IPromise<ICallParkRangeItem[]> {
    return this.CallParkService.getRangeList(this.location).then( ranges => {
      return ranges;
    });
  }

  public onSelectNumberRange(range: ICallParkRangeItem): void {
    this.singleNumber = '';
    this.range = range;
    this.startRange = range.startRange;
    this.endRange = range.endRange;
    this.onChangeFn({
      range: range,
    });
  }

  public getEndRangeList(startRange: string): ng.IPromise<string[]> {
    return this.CallParkService.getEndRange(startRange, this.location).then( endRanges => {
      return _.drop(endRanges);
    });
  }

  public onSelectStartEndRange(): void {
    this.rangeType = RangeType.RANGE;
  }

  public onSelectSingleNumber(): void {
    this.rangeType = RangeType.SINGLE;
  }

  public onChangeSingleNumber(): void {
    const range: ICallParkRangeItem = {
      startRange: this.singleNumber,
      endRange: this.singleNumber,
    };
    this.range = range;
    this.onChangeFn({
      range: range,
    });
  }

  public onChangeEndRange(): void {
    if (!_.isUndefined(this.startRange) && !_.isUndefined(this.endRange)) {
      const range: ICallParkRangeItem = {
        startRange: this.startRange,
        endRange: this.endRange,
      };
      this.range = range;
      this.onChangeFn({
        range: range,
      });
    }
  }

  public onSelectEndRange(): void {
    this.onChangeEndRange();
  }

  public onHandleKeyPress($keyCode): void {
    this.onKeyPressFn({
      keyCode: $keyCode,
    });
  }

  public clearOtherInput($event) {
    const name: string = $event.currentTarget.name;
    if (name === 'singleNumber') {
      {
        this.startRange = '';
        this.endRange = '';
      }
    } else {
      this.singleNumber = '';
    }
  }
}

export class CallParkNumberComponent implements ng.IComponentOptions {
  public controller = CallParkNumberCtrl;
  public template = require('modules/call/features/call-park/call-park-number/call-park-number.component.html');
  public bindings = {
    range: '<',
    extensionLength: '<',
    location: '<',
    onChangeFn: '&',
    onKeyPressFn: '&',
    setFocus: '<',
  };
}
