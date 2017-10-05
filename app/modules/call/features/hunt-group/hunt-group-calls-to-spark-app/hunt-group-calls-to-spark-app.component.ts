class HuntGroupCallsToSparkAppCtrl implements ng.IComponentController {
  public sendToApp: boolean;
  public onChangeFn: Function;
  public destinationRule: string;
  public isToggleDisabled: boolean = false;

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { destinationRule } = changes;
    if (destinationRule && destinationRule.currentValue) {
      this.destinationRule = destinationRule.currentValue;
      this.isToggleDisabled = this.destinationRule === 'TYPEFALLBACKRULE_AUTOMATIC' ? true : false;
    }
  }

  public onCallsToSparkAppChange(): void {
    this.onChangeFn();
  }
}

export class HuntGroupCallsToSparkAppComponent implements ng.IComponentOptions {
  public controller = HuntGroupCallsToSparkAppCtrl;
  public template = require('modules/call/features/hunt-group/hunt-group-calls-to-spark-app/hunt-group-calls-to-spark-app.component.html');
  public bindings = {
    sendToApp: '<',
    onChangeFn: '&',
    destinationRule: '<',
  };
}
