import { IACSiteInfo, IGotoWebex, LinkingMode } from './account-linking.interface';

class LinkedSitesDetailsComponentCtrl implements ng.IComponentController {

  public selectedSiteInfo: IACSiteInfo;
  public actionList;
  public linkAllUsers: boolean;
  public linkAllUsersNotAllowed: boolean = false;

  public webexPage: IGotoWebex;

  public showWizardFn: Function;
  public launchWebexFn: Function;

  public automaticLinkingTooltipText: string = 'accountLinking.siteDetails.automaticLinkingTooltip';

  /* @ngInject */
  constructor(private $log: ng.ILogService,
              private $state: ng.ui.IStateService,
              //private $rootScope: ng.IRootScopeService,
  ) {
    this.$log.debug('LinkedSitesDetailsComponentCtrl constructor, stateParams:');
  }

  public $onInit() {
    this.$log.debug('LinkedSitesDetailsComponentCtrl $onInit, selectedSiteInfo:', this.selectedSiteInfo);
  }

  public modifyLinkingMethod() {
    this.$log.info('Modify linking method by showing wizard using siteinfo:', this.selectedSiteInfo);
    this.showWizardFn({ siteInfo: this.selectedSiteInfo });
  }

  public showReports(siteUrl) {
    this.$state.go('reports.webex-metrics', { siteUrl: siteUrl });
  }

  public launchSiteAdmin(siteInfo) {
    this.$log.info('Launch Webex site admin from details for siteInfo:', siteInfo);
    this.launchWebexFn({ site: siteInfo, useHomepage: false });
  }

  public isAutomaticMode(): boolean {
    return (this.selectedSiteInfo.linkingMode === LinkingMode.AUTO_AGREEMENT ||
    this.selectedSiteInfo.linkingMode === LinkingMode.AUTO_VERIFY_DOMAIN);
  }

  public linkAllUsersChange(value) {
    this.$log.debug('linkAllUsersChange', value);
    this.$log.debug('linkAllUsersChange', this.selectedSiteInfo);
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
