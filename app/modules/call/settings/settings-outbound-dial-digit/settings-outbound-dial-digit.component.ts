import { InternalNumberRange } from 'modules/call/shared/internal-number-range';
import { IOption } from 'modules/huron/dialing/dialing.service';

class OutboundDialDigitCtrl implements ng.IComponentController {
  public selected: IOption;
  public steeringDigit: string;
  public internalNumberRanges: InternalNumberRange[];
  public onChangeFn: Function;

  public steeringDigitOptions: IOption[] = [];

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {
    this.steeringDigitOptions.push({
      label: this.$translate.instant('common.none'),
      value: 'null',
    });
    for (let index = 1; index < 10; index++) {
      this.steeringDigitOptions.push({
        label: _.toString(index),
        value: _.toString(index),
      });
    }
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const {
      internalNumberRanges,
      steeringDigit,
    } = changes;
    if (internalNumberRanges && internalNumberRanges.currentValue) {
      this.steeringDigitConflict();
    }

    if (steeringDigit && steeringDigit.currentValue) {
      this.selected = _.find(this.steeringDigitOptions, { value: steeringDigit.currentValue });
      this.steeringDigitConflict();
    }
  }

  public onSteeringDigitChanged(): void {
    this.onChangeFn({
      steeringDigit: _.get(this.selected, 'value'),
    });
  }

  public steeringDigitConflict(): boolean {
    const test = _.find(this.internalNumberRanges, range => {
      return (_.startsWith(range.beginNumber, this.steeringDigit)) ||
        _.startsWith(range.endNumber, this.steeringDigit);
    });

    return !_.isUndefined(test);
  }

}

export class OutboundDialDigitComponent implements ng.IComponentOptions {
  public controller = OutboundDialDigitCtrl;
  public template = require('modules/call/settings/settings-outbound-dial-digit/settings-outbound-dial-digit.component.html');
  public bindings = {
    steeringDigit: '<',
    internalNumberRanges: '<',
    onChangeFn: '&',
  };
}
