class SimultaneousCalls implements ng.IComponentController {
  public incomingCallMaximum: number;
  public onChangeFn: Function;

  public onSimultaneousCallsChange(value: number): void {
    this.change(value);
  }

  private change(value: number): void {
    this.onChangeFn({
      incomingCallMaximum: value,
    });
  }
}

export class SimultaneousCallsComponent implements ng.IComponentOptions {
  public controller = SimultaneousCalls;
  public template = require('modules/huron/simultaneousCalls/simultaneousCalls.html');
  public bindings = {
    incomingCallMaximum: '<',
    onChangeFn: '&',
  };
}
