import { AutoAssignTemplateService, IAutoAssignTemplateData } from 'modules/core/users/shared/auto-assign-template';

export class LicenseSummaryModalBodyController implements ng.IComponentController {
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

export class LicenseSummaryModalBodyComponent implements ng.IComponentOptions {
  public controller = LicenseSummaryModalBodyController;
  public template = require('./license-summary-modal-body.html');
  public bindings = {
    titleKey: '@',
    descriptionKey: '@',
    autoAssignTemplateData: '<',
  };
}
