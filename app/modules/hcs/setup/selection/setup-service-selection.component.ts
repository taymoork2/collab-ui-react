interface ICheckbox {
  license: Boolean;
  upgrade: Boolean;
}
export class SetupServiceSelectionController implements ng.IComponentController {
  public hcsServiceSelectionChkBox: ICheckbox;
  public onChangeFn: Function;
  /* @ngInject */
  constructor(
  ) {}

  public processChange() {
    this.onChangeFn(this.hcsServiceSelectionChkBox);
  }
}

export class SetupServiceSelectionComponent implements ng.IComponentOptions {
  public controller = SetupServiceSelectionController;
  public template = require('modules/hcs/setup/selection/setup-service-selection.component.html');
  public bindings = {
    onChangeFn: '&',
  };
}
