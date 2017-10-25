class SiteActionsRedistributeLicensesIconController implements ng.IComponentController {

  public onClickFn: Function;
  public license;
  public isOnlySite;

  public redistributeLicenses(license) {
    this.onClickFn({ license: license });
  }
}

export class SiteActionsRedistributeLicensesIconComponent implements ng.IComponentOptions {
  public template = require('./siteActionsRedistributeLicensesIcon.tpl.html');
  public controller = SiteActionsRedistributeLicensesIconController;
  public bindings = {
    isOnlySite: '<',
    license: '<',
    onClickFn: '&',
  };
}

angular.module('Core')
  .component('crSiteActionsLicensesIcon', new SiteActionsRedistributeLicensesIconComponent());
