export class SiteActionsRedistributeLicensesIconComponent implements ng.IComponentOptions {
  public template = require('./siteActionsRedistributeLicensesIcon.tpl.html');
}

angular.module('Core')
  .component('crSiteActionsLicensesIcon', new SiteActionsRedistributeLicensesIconComponent());
