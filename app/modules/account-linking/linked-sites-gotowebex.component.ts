import { IGotoWebex } from './account-linking.interface';

class LinkedSitesGotoWebexComponentCtrl implements ng.IComponentController {

  public trustSrc;
  public accessToken;
  public readyToLaunch: Function;
  public buttonId;

  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
    private WebExUtilsFact,
    private TokenService,
    private $sce,
    private $timeout,
  ) {
  }

  public $onChanges(changes) {
    this.$log.debug('LinkedSitesGotoWebexComponentCtrl $onChange', changes);
    const webexPage: IGotoWebex = changes.webexPage.currentValue;
    if (webexPage) {
      const toSiteListPage = webexPage.toSiteListPage;
      this.$log.debug('toSiteListPage', toSiteListPage);
      this.updateLinkToWebex(webexPage.siteUrl, toSiteListPage);
      this.buttonId = 'linked-sites-gotowebex_' + this.createUniqueId();
      this.$timeout( () => {
        this.readyToLaunch({ buttonId: this.buttonId });
      }, 100);
    }
  }

  private createUniqueId() {
    return Date.now();
  }

  private updateLinkToWebex = (siteUrl, toSiteListPage) => {
    this.$log.debug('updateLinkToSiteAdminPage', siteUrl);
    const adminUrl: any = [];
    adminUrl.push(this.WebExUtilsFact.getSiteAdminUrl(siteUrl));
    if (toSiteListPage) {
      adminUrl.push('&mainPage=');
      adminUrl.push(encodeURIComponent('accountlinking.do?siteUrl='));
      adminUrl.push(this.WebExUtilsFact.getSiteName(siteUrl));
    }

    const siteAdminUrl = adminUrl.join('');
    this.accessToken = this.TokenService.getAccessToken();
    this.trustSrc = this.$sce.trustAsResourceUrl(siteAdminUrl);
  }

}

export class LinkedSitesGotoWebexComponent implements ng.IComponentOptions {

  public controller = LinkedSitesGotoWebexComponentCtrl;
  public template = require('./linked-sites-gotowebex.component.html');
  public bindings = {
    webexPage: '<',
    readyToLaunch: '&',
  };
}
