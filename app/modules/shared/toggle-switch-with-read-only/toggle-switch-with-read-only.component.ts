class ToggleSwitchWithReadOnlyController implements ng.IComponentController {
  public label: string;
  public toggleId: string;
  public value: boolean;
  public isReadOnly: boolean;
  public onChangeFn: Function;

  public setValue(newValue: boolean): void {
    this.value = newValue;
    this.onChangeFn({
      toggleValue: this.value,
    });
  }
}

export class ToggleSwitchWithReadOnlyComponent implements ng.IComponentOptions {
  public controller = ToggleSwitchWithReadOnlyController;
  public template = require('modules/shared/toggle-switch-with-read-only/toggle-switch-with-read-only.html');
  public bindings = {
    label: '@',
    toggleId: '@',
    value: '<',
    isReadOnly: '<',
    onChangeFn: '&',
  };
}
