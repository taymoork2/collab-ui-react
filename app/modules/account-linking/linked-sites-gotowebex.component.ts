import { IGotoWebex } from './account-linking.interface';

class LinkedSitesGotoWebexComponentCtrl implements ng.IComponentController {
  public trustSrc: String;
  public accessToken: String;
  public webexSiteLaunchDetails: IGotoWebex;
  public buttonId: String;

  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
    private WebExUtilsFact,
    private TokenService,
    private $sce: ng.ISCEService,
    private $timeout: ng.ITimeoutService,
  ) {
  }

  public $onChanges(changes) {
    this.$log.debug('LinkedSitesGotoWebexComponentCtrl $onChange', changes);
    const launchDetails: IGotoWebex = changes.webexSiteLaunchDetails.currentValue;
    if (launchDetails) {
      const toSiteListPage = launchDetails.toSiteListPage;
      this.$log.debug('toSiteListPage', toSiteListPage);
      this.updateLinkToWebex(launchDetails.siteUrl, toSiteListPage);
      this.buttonId = 'linked-sites-gotowebex_' + this.createUniqueId();
      this.$timeout( () => {
        this.launchWebex(this.buttonId);
      }, 200);
    }
  }

  private createUniqueId() {
    return Date.now();
  }

  private updateLinkToWebex = (siteUrl, toSiteListPage) => {
    const siteAdminUrl = this.assembleLinkToWebExSiteAdmin(siteUrl, toSiteListPage);
    this.accessToken = this.TokenService.getAccessToken();
    this.trustSrc = this.$sce.trustAsResourceUrl(siteAdminUrl);
  }

  private assembleLinkToWebExSiteAdmin = (siteUrl, toSiteListPage) => {
    this.$log.debug('updateLinkToSiteAdminPage', siteUrl);
    this.$log.debug('siteUrl', siteUrl);
    this.$log.debug('toSiteListPage', toSiteListPage);

    const adminUrl: any = [];
    adminUrl.push(this.getSiteAdminUrl(siteUrl));
    adminUrl.push('siteurl=');
    adminUrl.push(this.WebExUtilsFact.getSiteName(siteUrl));
    if (toSiteListPage) {
      adminUrl.push('&mainPage=');
      adminUrl.push(encodeURIComponent('accountlinking.do'));
    }

    const siteAdminUrl = adminUrl.join('');
    this.$log.debug('SiteAdmin launch url:', siteAdminUrl);
    return siteAdminUrl;
  }

  private getSiteAdminUrl(siteUrl) {
    const siteAdminProtocol = 'https://';
    const siteAdminLink = '/wbxadmin/default.do?';
    return siteAdminProtocol + siteUrl + siteAdminLink;
  }

  private launchWebex(buttonId) {
    this.$log.debug('ready to launch with buttonId', buttonId);
    const buttonElement = angular.element('#' + buttonId);

    if (buttonElement) {
      buttonElement.click();
    } else {
      this.$log.warn('Webex launch mechanism not found!');
    }
  }
}

export class LinkedSitesGotoWebexComponent implements ng.IComponentOptions {

  public controller = LinkedSitesGotoWebexComponentCtrl;
  public template = require('./linked-sites-gotowebex.component.html');
  public bindings = {
    webexSiteLaunchDetails: '<',
  };
}
