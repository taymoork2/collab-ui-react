import { ICheckbox } from 'modules/hcs/hcs-setup';

export class SetupServiceSelectionController implements ng.IComponentController {
  public hcsServiceSelectionChkBox: ICheckbox = { license: false, upgrade: false };
  public onChangeFn: Function;
  /* @ngInject */
  constructor(
  ) {}

  public processChange() {
    this.onChangeFn({
      selected: this.hcsServiceSelectionChkBox,
    });
  }
}

export class SetupServiceSelectionComponent implements ng.IComponentOptions {
  public controller = SetupServiceSelectionController;
  public template = require('modules/hcs/hcs-setup/hcs-setup-selection/setup-service-selection.component.html');
  public bindings = {
    onChangeFn: '&',
  };
}
