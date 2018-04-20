import { FallbackDestination } from 'modules/call/features/shared/call-feature-fallback-destination';
import { DestinationRule, HuntGroupNumber, HuntMethod } from 'modules/call/features/hunt-group';

class HuntGroupFallbackDestinationCtrl implements ng.IComponentController {

  public destinationRule: DestinationRule;
  public fallbackDestination: FallbackDestination;
  public alternateDestination: FallbackDestination;
  public onChangeDestinationRuleFn: Function;
  public onChangeDestinationFn: Function;
  public onChangeAlternateFn: Function;
  public numbers: HuntGroupNumber[];
  public method: HuntMethod;
  public options: number[] = [2, 5, 10, 30, 60];
  public fallbackDestForm: ng.IFormController;

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { destinationRule, fallbackDestination, alternateDestination } = changes;

    if (destinationRule && destinationRule.currentValue) {
      if (this.fallbackDestForm && destinationRule.currentValue) {
        this.destinationRule = destinationRule.currentValue;
      }
    }
    if (fallbackDestination && fallbackDestination.currentValue) {
      this.fallbackDestination = fallbackDestination.currentValue;
    }
    if (alternateDestination && alternateDestination.currentValue) {
      this.alternateDestination = alternateDestination.currentValue;
    }
  }

  public setHuntGroupDestinationRule(destinationRule: DestinationRule): void {
    this.destinationRule = destinationRule;
    this.onChangeDestinationRuleFn({
      destinationRule: this.destinationRule,
    });
  }

  public setHuntGroupFallbackDestination(destination: FallbackDestination): void {
    this.fallbackDestination = destination;
    this.onChangeDestinationFn({
      fallbackDestination: destination,
    });
  }

  public setHuntGroupAlternateDestination(destination: FallbackDestination): void {
    this.alternateDestination = destination;
    this.onChangeAlternateFn({
      alternateDestination: this.alternateDestination,
    });
  }

  public setTimerMins(minutes: number): void {
    this.alternateDestination.timer = minutes;
    this.onChangeAlternateFn({
      alternateDestination: this.alternateDestination,
    });
  }

}

export class HuntGroupFallbackDestinationComponent implements ng.IComponentOptions {
  public controller = HuntGroupFallbackDestinationCtrl;
  public template = require('modules/call/features/hunt-group/hunt-group-fallback-destination/hunt-group-fallback-destination.component.html');
  public bindings = {
    destinationRule: '<',
    fallbackDestination: '<',
    alternateDestination: '<',
    method: '<',
    numbers: '<',
    onChangeDestinationRuleFn: '&',
    onChangeDestinationFn: '&',
    onChangeAlternateFn: '&',
  };
}
