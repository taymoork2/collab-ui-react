import { FallbackDestination } from 'modules/huron/features/components/callFeatureFallbackDestination/services';

class CallParkFallbackDestinationCtrl implements ng.IComponentController {
  public fallbackDestination: FallbackDestination;
  public onChangeFn: Function;

  public reversionType: string = 'parker';
  public showReversionLookup: boolean = false;

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    let callParkChanges = changes['fallbackDestination'];
    if (callParkChanges && callParkChanges.currentValue) {
      this.processCallParkFallbackDestChanges(callParkChanges);
    }
  }

  private processCallParkFallbackDestChanges(callParkChanges: ng.IChangesObject): void {
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
  public templateUrl = 'modules/huron/features/callPark/callParkFallbackDestination/callParkFallbackDestination.html';
  public bindings = {
    fallbackDestination: '<',
    onChangeFn: '&',
  };
}
