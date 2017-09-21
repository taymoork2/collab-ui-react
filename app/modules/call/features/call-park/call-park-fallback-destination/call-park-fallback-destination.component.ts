import { FallbackDestination } from 'modules/call/features/shared/call-feature-fallback-destination';

class CallParkFallbackDestinationCtrl implements ng.IComponentController {
  public fallbackDestination: FallbackDestination;
  public onChangeFn: Function;

  public reversionType: string = 'parker';
  public showReversionLookup: boolean = false;
  public location;

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const callParkChanges = changes['fallbackDestination'];
    if (callParkChanges && callParkChanges.currentValue) {
      this.processCallParkFallbackDestChanges(callParkChanges);
    }
  }

  private processCallParkFallbackDestChanges(callParkChanges: ng.IChangesObject<any>): void {
    if (_.isNull(callParkChanges.currentValue.number) && _.isNull(callParkChanges.currentValue.numberUuid)) {
      this.reversionType = 'parker';
      this.showReversionLookup = false;
    } else {
      this.reversionType = 'destination';
      this.showReversionLookup = true;
    }
  }

  public onSelectRevertToParker(): void {
    this.onChangeFn({
      fallbackDestination: new FallbackDestination(),
    });
  }

  public onSelectAnotherDestination(): void {
    this.showReversionLookup = true;
  }

  public setCallParkFallbackDestination(fallbackDestination): void {
    this.fallbackDestination = fallbackDestination;
    this.onChangeFn({
      fallbackDestination: this.fallbackDestination,
    });
  }

}

export class CallParkFallbackDestinationComponent implements ng.IComponentOptions {
  public controller = CallParkFallbackDestinationCtrl;
  public template = require('modules/call/features/call-park/call-park-fallback-destination/call-park-fallback-destination.component.html');
  public bindings = {
    fallbackDestination: '<',
    onChangeFn: '&',
    location: '<',
  };
}
