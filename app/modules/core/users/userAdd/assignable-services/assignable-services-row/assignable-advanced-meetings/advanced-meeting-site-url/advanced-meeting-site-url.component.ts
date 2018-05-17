class AdvancedMeetingSiteUrlController implements ng.IComponentController {

  private siteUrl: string;
  public siteAdminUrl: string;
  private isCISite: boolean;

  /* @ngInject */
  constructor(
    private WebExUtilsFact,
  ) {}

  public $onInit(): void {
    this.isCISite = this.WebExUtilsFact.isCIEnabledSite(this.siteUrl);
    this.siteAdminUrl = this.isCISite ? '' : this.WebExUtilsFact.getSiteAdminUrl(this.siteUrl);
  }
}

export class AdvancedMeetingSiteUrlComponent implements ng.IComponentOptions {
  public controller = AdvancedMeetingSiteUrlController;
  public template = require('./advanced-meeting-site-url.html');
  public bindings = {
    siteUrl: '@',
  };
}
