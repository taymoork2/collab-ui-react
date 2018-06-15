class WebexSiteNewDisplayCtrl implements ng.IComponentController {

  /* @ngInject */
  constructor() {
  }
  public site;
  public index: number;
  public isShowUserManagement;
  private onRemoveSite: Function;
  public canRemoveSite;

  public removeSite() {
    this.onRemoveSite({ index: this.index });
  }
}

export class WebexSiteNewDisplayComponent implements ng.IComponentOptions {
  public controller = WebexSiteNewDisplayCtrl;
  public template = require('./webex-site-new-display.html');
  public bindings = {
    site: '<',
    isShowUserManagement: '<',
    onRemoveSite: '&?',
    canRemoveSite: '<',
    index: '<',
  };
}
