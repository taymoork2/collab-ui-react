class WebexSiteResultDisplayCtrl implements ng.IComponentController {

  /* @ngInject */
  constructor() {
  }
  public action;
  public isSuccess: number;

  private getResultText() {
    if (this.isSuccess === undefined) {
      return null;
    }
    const status = this.isSuccess ? 'Success' : 'Failure';
    return 'webexSiteManagement.' + this.action + status;
  }

  public getBodyResultText() {
    const result = this.getResultText();
    return !result ? '' : result + 'ModalBody';
  }

  public getTitleResultText() {
    const result = this.getResultText();
    return !result ? '' : result + 'ModalTitle';
  }
}

export class WebexSiteResultDisplayComponent implements ng.IComponentOptions {
  public controller = WebexSiteResultDisplayCtrl;
  public template = require('./webex-site-result-display.html');
  public bindings = {
    action: '<',
    isSuccess: '<',
  };
}
