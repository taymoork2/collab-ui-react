
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

class SimultaneousCallsComponent implements ng.IComponentOptions {
  public controller = SimultaneousCalls;
  public templateUrl = 'modules/huron/simultaneousCalls/simultaneousCalls.html';
  public bindings: {[bindings: string]: string} = {
    incomingCallMaximum: '<',
    onChangeFn: '&'
  }
}

export default angular
  .module('huron.simultaneous-calls', [
    'atlas.templates',
    'cisco.ui',
    'pascalprecht.translate'
  ])
  .component('ucSimultaneousCalls', new SimultaneousCallsComponent())
  .name;