class LicenseSummaryItemController implements ng.IComponentController {
}

export class LicenseSummaryItemComponent implements ng.IComponentOptions {
  public controller = LicenseSummaryItemController;
  public template = require('./license-summary-item.html');
  public bindings = {
    l10nTitle: '@',
    totalUsage: '<',
    totalVolume: '<',
    siteUrl: '@?',
  };
}
