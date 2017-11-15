class AssignableServiceItemCheckboxController implements ng.IComponentController {
}

export class AssignableServiceItemCheckboxComponent implements ng.IComponentOptions {
  public controller = AssignableServiceItemCheckboxController;
  public template = require('./assignable-service-item-checkbox.html');
  public transclude = true;
  public bindings = {
    serviceItemId: '<',
    l10nLabel: '@',
  };
}
