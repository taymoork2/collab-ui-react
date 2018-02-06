import { AutoAssignTemplateService, IAutoAssignTemplateData } from 'modules/core/users/shared/auto-assign-template';

export class AutoAssignTemplateSummaryContainerController implements ng.IComponentController {
  public autoAssignTemplateData?: IAutoAssignTemplateData;

  /* @ngInject */
  constructor(
    private AutoAssignTemplateService: AutoAssignTemplateService,
  ) {}

  public $onInit() {
    if (this.autoAssignTemplateData) {
      return;
    }
    this.AutoAssignTemplateService.getDefaultStateData().then((autoAssignTemplateData) => {
      this.autoAssignTemplateData = autoAssignTemplateData;
    });
  }
}

export class AutoAssignTemplateSummaryContainerComponent implements ng.IComponentOptions {
  public controller = AutoAssignTemplateSummaryContainerController;
  public template = require('./auto-assign-template-summary-container.html');
  public bindings = {
    titleKey: '@',
    descriptionKey: '@',
    autoAssignTemplateData: '<',
  };
}
