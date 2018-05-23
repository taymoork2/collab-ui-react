import { IToolkitModalService } from 'modules/core/modal';
import { IACSiteInfo, IGotoWebex, LinkingMode } from './account-linking.interface';
import { LinkedSitesService } from './linked-sites.service';

interface ILinkAllUsersModalScope extends ng.IScope {
  linkAllUsers?: boolean;
}

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
              private $modal: IToolkitModalService,
              private $scope: ng.IScope,
              private LinkedSitesService: LinkedSitesService,
  ) {
    this.$log.debug('LinkedSitesDetailsComponentCtrl constructor');
  }

  public $onInit() {
    this.$log.debug('LinkedSitesDetailsComponentCtrl $onInit, selectedSiteInfo:', this.selectedSiteInfo);
  }

  public modifyLinkingMethod() {
    this.$log.debug('Modify linking method from details slidin by launching wizard with siteInfo:', this.selectedSiteInfo);
    this.showWizardFn({
      siteInfo: this.selectedSiteInfo,
    });
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
    const modalScope: ILinkAllUsersModalScope = this.$scope.$new();
    modalScope.linkAllUsers = this.selectedSiteInfo.linkAllUsers;
    const currLinkAllUsers = this.selectedSiteInfo.linkAllUsers;
    const modal = this.$modal.open({
      type: 'dialog',
      template: require('modules/account-linking/link-all-users-modal.html'),
      modalClass: 'link-all-users',
      scope: modalScope,
    });
    this.$log.debug('modal', modal);
    modal.result.then((result) => {
      this.$log.debug('result', result);
      if (result === 'LINK_START') {
        this.LinkedSitesService.setLinkAllUsers(this.selectedSiteInfo.linkedSiteUrl, true);
      } else if (result === 'LINK_STOP') {
        this.LinkedSitesService.setLinkAllUsers(this.selectedSiteInfo.linkedSiteUrl, false);
      }
    }, (reject) => {
      this.$log.debug('reject', reject);
      this.selectedSiteInfo.linkAllUsers = currLinkAllUsers;
    });
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
