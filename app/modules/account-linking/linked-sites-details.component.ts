import { IACSiteInfo, IGotoWebex, LinkingMode } from './account-linking.interface';

class LinkedSitesDetailsComponentCtrl implements ng.IComponentController {

  public selectedSiteInfo: IACSiteInfo;
  public actionList;

  public webexPage: IGotoWebex;

  public showWizardFn: Function;
  public launchWebexFn: Function;

  /* @ngInject */
  constructor(private $log: ng.ILogService,
              private $state: ng.ui.IStateService,
              //private $rootScope: ng.IRootScopeService,
  ) {
    this.$log.debug('LinkedSitesDetailsComponentCtrl constructor, stateParams:');
  }

  public $onInit() {
    this.$log.debug('LinkedSitesDetailsComponentCtrl $onInit, selectedSiteInfo:', this.selectedSiteInfo);
    // this.$rootScope.$on('ACCOUNT_LINKING_CHANGE', (_event: angular.IAngularEvent, siteInfo, webexData): void => {
    //   this.selectedSiteInfo.linkingMode = webexData.accountLinkingMode;
    // });
  }

  public modifyLinkingMethod() {
    this.$log.info('Modify linking method by showingw wizard using siteinfo:', this.selectedSiteInfo);
    this.showWizardFn({ siteInfo: this.selectedSiteInfo });
  }

  public showReports(siteUrl) {
    this.$state.go('reports.webex-metrics', { siteUrl: siteUrl });
  }

  public launchSiteAdmin(siteUrl) {
    this.$log.info('Launch Webex site admin from details for site', siteUrl);
    this.launchWebexFn({ site: siteUrl, useHomepage: false });
  }

  public isAutomaticMode(): boolean {
    return (this.selectedSiteInfo.linkingMode === LinkingMode.AUTO_AGREEMENT ||
    this.selectedSiteInfo.linkingMode === LinkingMode.AUTO_VERIFY_DOMAIN);
  }

}

export class LinkedSitesDetailsComponent implements ng.IComponentOptions {

  public controller = LinkedSitesDetailsComponentCtrl;
  public template = require('./linked-sites-details.component.html');
  public bindings = {
    selectedSiteInfo: '<',
    showWizardFn: '&',
    launchWebexFn: '&',
  };
}
