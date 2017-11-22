class AutoAssignTemplateManageOptionsController implements ng.IComponentController {

  /* @ngInject */
  constructor(
  ) {}
}

export class AutoAssignTemplateManageOptionsComponent implements ng.IComponentOptions {
  public controller = AutoAssignTemplateManageOptionsController;
  public template = require('./auto-assign-template-manage-options.html');
  public bindings = {};
}
