class AutoAssignTemplateSummaryItemController implements ng.IComponentController {
}

export class AutoAssignTemplateSummaryItemComponent implements ng.IComponentOptions {
  public controller = AutoAssignTemplateSummaryItemController;
  public template = require('./auto-assign-template-summary-item.html');
  public bindings = {
    l10nTitle: '@',
    totalUsage: '<',
    totalVolume: '<',
    siteUrl: '@?',
  };
}
