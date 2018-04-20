class ToggleSwitchWithReadOnlyController implements ng.IComponentController {
  public csAriaLabel?: string;
  public label: string;
  public toggleId: string;
  public value: boolean;
  public isReadOnly: boolean;
  public onChangeFn: Function;

  public get ariaLabel(): string {
    return _.isString(this.csAriaLabel) ? this.csAriaLabel : 'common.readonly';
  }

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
    csAriaLabel: '@?',
    label: '@',
    toggleId: '@',
    value: '<',
    isReadOnly: '<',
    onChangeFn: '&',
  };
}
