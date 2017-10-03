class WebexSiteNewDisplayCtrl implements ng.IComponentController {

  /* @ngInject */
  constructor() {
  }
  public site;
  private index: number;
  private isShowUserManagement = false;
  private onRemoveSite: Function;
  public canRemoveSite = false;

  public $onChanges(changes: ng.IOnChangesObject) {
    if (changes.site) {
      this.site = changes.site.currentValue;
    }
    if (changes.index) {
      this.index = changes.index.currentValue;
    }
    if (changes.canRemoveSite) {
      this.canRemoveSite = changes.canRemoveSite.currentValue;
    }
    if (changes.isShowUserManagement) {
      this.isShowUserManagement = changes.isShowUserManagement.currentValue;
    }
  }

  public removeSite() {
    this.onRemoveSite({ index: this.index });
  }
}

export class WebexSiteNewDisplayComponent implements ng.IComponentOptions {
  public controller = WebexSiteNewDisplayCtrl;
  public template = require('modules/core/siteList/webex-site/webex-site-new-display.html');
  public bindings = {
    site: '<',
    isShowUserManagement: '<',
    onRemoveSite: '&?',
    canRemoveSite: '<',
    index: '<',
  };
}

