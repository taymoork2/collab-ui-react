class SiteActionsDeleteSiteIconController implements ng.IComponentController {

  public onClickFn: Function;
  public license;
  public isOnlySite;

  public delete(license) {
    this.onClickFn({ license: license });
  }
}

export class SiteActionsDeleteSiteIconComponent implements ng.IComponentOptions {
  public template = require('./siteActionsDeleteIcon.tpl.html');
  public controller = SiteActionsDeleteSiteIconController;
  public bindings = {
    isOnlySite: '<',
    license: '<',
    onClickFn: '&',
  };
}

angular.module('Core')
  .component('crSiteActionsDeleteIcon', new SiteActionsDeleteSiteIconComponent());
