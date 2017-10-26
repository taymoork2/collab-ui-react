import { LinkingOperation, IACSiteInfo, IGotoWebex } from './account-linking.interface';

class LinkedSitesDetailsComponentCtrl implements ng.IComponentController {

  public selectedSite: IACSiteInfo;
  public actionList;
  public originator;

  public webexPage: IGotoWebex;

  /* @ngInject */
  constructor(private $log: ng.ILogService,
              private $stateParams: any,
              private $state,
  ) {
    this.$log.debug('LinkedSitesDetailsComponentCtrl constructor, stateParams:', this.$stateParams);
    this.selectedSite = this.$stateParams.siteInfo;
    this.originator = this.$stateParams.originator;
  }

  public $onInit() {
    this.$log.debug('LinkedSitesDetailsComponentCtrl $onInit');
  }

  public modifyLinkingMethod() {
    this.$state.go('site-list.linked.details.wizard', { siteInfo: this.selectedSite, operation: LinkingOperation.Modify });
  }

  public showReports(siteUrl) {
    this.$state.go('reports.webex-metrics', { siteUrl: siteUrl });
  }

  public launchSiteAdmin() {
    this.prepareLaunchButton(this.selectedSite.linkedSiteUrl, true);
  }

  public readyToLaunch(buttonId) {
    this.$log.debug('readyToLaunch', buttonId);
    angular.element('#' + buttonId).click();
  }

  private prepareLaunchButton(siteUrl, toSiteListPage) {

    this.webexPage = {
      siteUrl: siteUrl,
      toSiteListPage: toSiteListPage,
    };

    this.$log.debug(' webexPage', this.webexPage);
  }
}

export class LinkedSitesDetailsComponent implements ng.IComponentOptions {

  public controller = LinkedSitesDetailsComponentCtrl;
  public template = require('modules/account-linking/linked-sites-details.component.html');
  public bindings = {
  };
}
