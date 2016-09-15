class SimultaneousCalls {
  public incomingCallMaximum: number;
  public onChangeFn: Function;

  public onSimultaneousCallsChange(value: number): void {
    this.change(value);
  }

  private change(value: number): void {
    this.onChangeFn({
      incomingCallMaximum: value
    })
  }
}

export class SimultaneousCallsComponent implements ng.IComponentOptions {
  public controller = SimultaneousCalls;
  public templateUrl = 'modules/huron/simultaneousCalls/simultaneousCalls.html';
  public bindings: {[bindings: string]: string} = {
    incomingCallMaximum: '<',
    onChangeFn: '&'
  }
}
