import { AutoAssignTemplateService } from 'modules/core/users/shared/auto-assign-template';

export class AutoAssignLicenseSummaryController implements ng.IComponentController {
  public autoAssignTemplateData;

  /* @ngInject */
  constructor(
    private AutoAssignTemplateService: AutoAssignTemplateService,
  ) {}

  public $onInit() {
    this.AutoAssignTemplateService.getDefaultStateData().then((autoAssignTemplateData) => {
      this.autoAssignTemplateData = autoAssignTemplateData;
    });
  }
}

export class AutoAssignLicenseSummaryComponent implements ng.IComponentOptions {
  public controller = AutoAssignLicenseSummaryController;
  public template = require('./auto-assign-license-summary.html');
  public bindings = {};
}
