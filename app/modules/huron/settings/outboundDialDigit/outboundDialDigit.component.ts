import { IExtensionRange } from 'modules/huron/settings/extensionRange';

const STEERING_DIGIT_OPTIONS: Array<string> = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

class OutboundDialDigitCtrl implements ng.IComponentController {
  public steeringDigit: string;
  public internalNumberRanges: Array<IExtensionRange>;
  public onChangeFn: Function;

  public steeringDigitOptions: Array<string> = STEERING_DIGIT_OPTIONS;

  /* @ngInject */
  constructor() { }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    const { internalNumberRanges } = changes;
    if (internalNumberRanges && internalNumberRanges.currentValue) {
      this.steeringDigitConflict();
    }

    const { steeringDigit } = changes;
    if (steeringDigit && steeringDigit.currentValue) {
      this.steeringDigitConflict();
    }
  }

  public onSteeringDigitChanged(): void {
    this.onChangeFn({
      steeringDigit: this.steeringDigit,
    });
  }

  public steeringDigitConflict(): boolean {
    let test = _.find(this.internalNumberRanges, range => {
      return (_.startsWith(range.beginNumber, this.steeringDigit)) ||
        _.startsWith(range.endNumber, this.steeringDigit);
    });

    return !_.isUndefined(test);
  }

}

export class OutboundDialDigitComponent implements ng.IComponentOptions {
  public controller = OutboundDialDigitCtrl;
  public templateUrl = 'modules/huron/settings/outboundDialDigit/outboundDialDigit.html';
  public bindings = {
    steeringDigit: '<',
    internalNumberRanges: '<',
    onChangeFn: '&',
  };
}

