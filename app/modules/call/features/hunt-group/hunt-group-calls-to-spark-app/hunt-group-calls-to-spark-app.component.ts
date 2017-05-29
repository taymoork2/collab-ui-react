class HuntGroupCallsToSparkAppCtrl implements ng.IComponentController {
  public callsToSparkApp: boolean = true;
  public onChangeFn: Function;

  public onCallsToSparkAppChange(): void {
    this.onChangeFn();
  }
}

export class HuntGroupCallsToSparkAppComponent implements ng.IComponentOptions {
  public controller = HuntGroupCallsToSparkAppCtrl;
  public templateUrl = 'modules/call/features/hunt-group/hunt-group-calls-to-spark-app/hunt-group-calls-to-spark-app.component.html';
  public bindings = {
    callsToSparkApp: '<',
    onChangeFn: '&',
  };
}
