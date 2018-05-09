// TODO: this file needs to be revisited to:
// - add missing return types for functions
// - add missing types for function args
// - replace instances of `any` with better TS types as-appropriate
import { EventNames } from 'modules/core/siteList/webex-site/webex-site.constants';
import { IToolkitModalService } from 'modules/core/modal';
import { IWebexSite } from 'modules/core/siteList/shared/site.interface';
import { Notification } from 'modules/core/notifications/notification.service';
import { SetupWizardService } from 'modules/core/setupWizard/setup-wizard.service';
import { SiteListService } from 'modules/core/siteList/shared/site-list.service';
import { WebExSiteService } from 'modules/core/siteList/webex-site/webex-site.service';

enum ACTION {
  ADD = 'add',
  DELETE = 'delete',
  REDISTRIBUTE = 'redistribute',
}

class SiteListComponentCtrl implements ng.IComponentController {
  public hideLinked: boolean;

  private rootScopeDeregisters: any[] = [];

  public accessToken: any;
  public allCenterDetailsForSubscriptions: any[];
  public canAddSite = false;
  public gridOptions: any;
  public isAdminPage = false;
  public showGridData = false;
  public siteAdminUrl: string;
  public subscriptions: any[];

  public get showAddSite(): boolean {
    return !_.isEmpty(this.SiteListService.managedSites) &&
      this.SiteListService.canAddSite();
  }

  /*@ngInject*/
  constructor(
    private $modal: IToolkitModalService,
    private $rootScope: ng.IRootScopeService,
    private $sce: ng.ISCEService,
    private $state: ng.ui.IStateService,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private Auth,
    private Authinfo,
    private ModalService: IToolkitModalService,
    private Notification: Notification,
    private SetupWizardService: SetupWizardService,
    private SiteListService: SiteListService,
    private TokenService,
    private Utils,
    private WebExSiteService: WebExSiteService,
    private WebExUtilsFact,
  ) {
  }

  public $onInit() {
    this.bindEvents();
    this.canAddSite = this.SiteListService.canAddSite();
    this.isAdminPage = this.Utils.isAdminPage();
    this.subscriptions = this.Authinfo.getSubscriptions();
    this.initializeData();
    this.WebExSiteService.getAllCenterDetailsFromSubscriptions().then((results) => {
      this.allCenterDetailsForSubscriptions = results;
    });
  }

  public $onDestroy() {
    // kill the csv poll when navigating away from the site list page
    this.SiteListService.stopPolling();
    // this will allow re-entry to this page to use fresh content
    this.SiteListService.initSiteRowsObj();
    this.rootScopeDeregisters.forEach(deregister => deregister());
  }

  public initializeData(): void {
    this.SiteListService.initSiteRows(this.hideLinked);
    this.gridOptions = this.SiteListService.getGridOptions();
    this.gridOptions.appScopeProvider = this;
    this.showGridData = true;
  }

  public linkToReports(siteUrl: string): void {
    this.$state.go('reports.webex-metrics', { siteUrl: siteUrl });
  }

  public linkToSiteAdminHomePage(siteUrl: string): void {
    this.linkTOSiteAdminPage(siteUrl, false);
  }

  public linkToSiteAdminLinkedPage(siteUrl: string): void {
    this.linkTOSiteAdminPage(siteUrl, true);
  }

  public trustSrc(src: string) {
    return this.$sce.trustAsResourceUrl(src);
  }

  public redistributeLicenses(entity): void {
    if (this.canModify(entity)) {
      this.$state.go('site-list-distribute-licenses', { subscriptionId: entity.billingServiceId, centerDetails: this.getCenterDetailsForSingleSubscription(entity.billingServiceId) });
    } else {
      this.showRejectionModal(ACTION.REDISTRIBUTE, this.isOnlySiteInSubscription(entity));
    }
  }

  public addSite(): void {
    if (this.SiteListService.hasNonPendingSubscriptions()) {
      this.$state.go('site-list-add', { centerDetailsForAllSubscriptions: this.allCenterDetailsForSubscriptions });
    } else {
      this.showRejectionModal(ACTION.ADD, false);
    }
  }

  public canModify(entity): boolean {
    return !this.isOnlySiteInSubscription(entity) && !this.SetupWizardService.isSubscriptionPending(entity.billingServiceId);
  }

  public getCenterDetailsForSingleSubscription(externalSubId) {
    const singleSub = _.find(this.allCenterDetailsForSubscriptions, { externalSubscriptionId: externalSubId });
    return _.get(singleSub, 'purchasedServices', []);
  }

  public isSubscriptionEnterprise(subscription): boolean {
    return this.SiteListService.isSubscriptionEnterprise(subscription);
  }

  public deleteSite(entity): void {
    const subscriptionId = entity.billingServiceId;
    const siteUrl = entity.siteUrl;
    if (this.canModify(entity)) {
      this.$modal.open({
        type: 'dialog',
        template: require('./siteDeleteConfirmModal.tpl.html'),
        controller: function () {
          const ctrl = this;
          ctrl.siteUrl = siteUrl;
        },
        controllerAs: '$ctrl',
      }).result.then(() => {
        this.removeSite(subscriptionId, siteUrl);
      });
    } else {
      this.showRejectionModal(ACTION.DELETE, this.isOnlySiteInSubscription(entity));
    }
  }

  public onSiteSelected(site: IWebexSite): void {
    this.$state.go('site-list.not-linked.detail', {
      selectedSite: site,
      onDelete: (license) => { this.deleteSite(license); },
      onRedistribute: (license) => { this.redistributeLicenses(license); },
    });
  }

  private removeSite(subscriptionId: string, siteUrl: string): void {
    const sites = this.SiteListService.getLicensesInSubscriptionGroupedBySites(subscriptionId);
    if (_.keys(sites).length === 2) {
      const remainingSite = this.moveLicensesToRemainingSite(sites, siteUrl);
      this.WebExSiteService.deleteSite(subscriptionId, remainingSite)
        .then(() => {
          const params = {
            title: this.$translate.instant('webexSiteManagement.deleteSiteSuccessModalTitle'),
            message: this.$translate.instant('webexSiteManagement.deleteSiteSuccessModalBody'),
            hideDismiss: true,
          };
          this.ModalService.open(params).result.then(() => this.refreshSiteListData());
          this.Notification.success('webexSiteManagement.deleteSiteSuccessToaster');
        })
        .catch((response) => {
          this.Notification.errorWithTrackingId(response, 'webexSiteManagement.deleteSiteFailureToaster');
        });
    } else {
      this.$state.go('site-list-delete', { subscriptionId: subscriptionId, siteUrl: siteUrl, centerDetails: this.getCenterDetailsForSingleSubscription(subscriptionId) });
    }
  }

  private isOnlySiteInSubscription(entity): boolean {
    if (!entity.billingServiceId) {
      return true;
    }
    const siteUrl = _.keys(this.SiteListService.getLicensesInSubscriptionGroupedBySites(entity.billingServiceId));
    return siteUrl.length === 1;
  }

  private moveLicensesToRemainingSite(sites, urlToRemove: string) {
    const keys = _.keys(sites);
    _.pull(keys, urlToRemove);
    const remainingSiteUrl = keys[0];
    const siteToRemove = sites[urlToRemove];
    const remainingSite = _.map(sites[remainingSiteUrl], (site: any) => ({
      centerType: site.offerName,
      quantity: site.volume,
      siteUrl: site.siteUrl,
    }));

    _.forEach(siteToRemove, (license) => {
      const i = _.findIndex(remainingSite, { centerType: license.offerName });
      if (i > -1) {
        remainingSite[i].quantity = remainingSite[i].quantity + license.volume;
      } else {
        remainingSite.push(
          {
            centerType: license.offerName,
            quantity: license.volume,
            siteUrl: remainingSiteUrl,
          });
      }
    });
    return remainingSite;
  }

  private linkTOSiteAdminPage(siteUrl: string, toLinkedPage: boolean): void {
    const adminUrl: string[] = [];
    adminUrl.push(this.WebExUtilsFact.getSiteAdminUrl(siteUrl));
    if (toLinkedPage) {
      adminUrl.push('&mainPage=');
      adminUrl.push(encodeURIComponent('accountlinking.do?siteUrl='));
      adminUrl.push(this.WebExUtilsFact.getSiteName(siteUrl));
    }
    this.siteAdminUrl = adminUrl.join('');

    this.accessToken = this.TokenService.getAccessToken();
    this.$timeout(() => {
      angular.element('#webExLinkedSiteFormBtn').click();
    }, 100);
  }

  private goToMeetingSetup(): void {
    this.$state.go('setupwizardmodal', {
      currentTab: 'meetingSettings',
      onlyShowSingleTab: true,
      showStandardModal: true,
    });
  }

  private refreshSiteListData(): void {
    this.Auth.getCustomerAccount(this.Authinfo.getOrgId()).then((response) => {
      this.Authinfo.updateAccountInfo(response.data);
      this.initializeData();
    });
  }

  private showRejectionModal(action: ACTION, isOnlySite: boolean): void {
    /*  algendel 11/13/17. We are working on implementation where in certain instances of pending setup
    the user is sent to the setup screen. This should come within a week. therefore I am leaving in the
    code to make this happen gated by this false isShowSetup flag below */

    const isShowSetup = false;
    let title, errorMessage;
    switch (action) {
      case ACTION.ADD:
        title = 'webexSiteManagement.addSiteRejectModalTitle';
        errorMessage = 'webexSiteManagement.addSiteRejectPending';
        break;
      case ACTION.DELETE:
        errorMessage = isOnlySite ? 'webexSiteManagement.deleteSiteRejectModalBodyOnlySite' : 'webexSiteManagement.deleteSiteRejectModalBodyPending';
        title = 'webexSiteManagement.deleteSiteRejectModalTitle';
        break;
      case ACTION.REDISTRIBUTE:
        errorMessage = isOnlySite ? 'webexSiteManagement.redistributeRejectModalBodyOnlySite' : 'webexSiteManagement.redistributeRejectModalBodyPending';
        title = 'webexSiteManagement.redistributeRejectModalTitle';
        break;
    }

    const params = {
      title: this.$translate.instant(title),
      message: this.$translate.instant(errorMessage),
      dismiss: this.$translate.instant('common.dismiss'),
      close: this.$translate.instant('common.dismiss'),
      hideDismiss: true,
    };

    if (isShowSetup) {
      params.hideDismiss = false;
      params.close = this.$translate.instant('common.setUp');
    }
    this.ModalService.open(params).result.then(() => {
      if (isShowSetup) {
        this.goToMeetingSetup();
      }
    });
  }

  private bindEvents(): void {
    // algendel - notes:
    // - it has been observed that when trying to launch setup wizard modal from add site modal, the
    //   setup wizard modal comes up blank
    // - this is possibly related to redirecting from a modal state to a modal state
    // - as a workaround, we:
    //   - emit an event
    //   - close the modal
    //   - 'siteRowCtrl' catches the event (since it's not a modal), and launches the setup wizard
    // - in order to avoid conflicting animations (one modal closing, another one opening), we insert
    //   an 800ms delay
    // 11/15/17 we are temporarily taking out the setup launch. This should be brought back within a week.

    const deregisterMeetingSetup = this.$rootScope.$on(EventNames.LAUNCH_MEETING_SETUP, () => {
      this.$timeout(() => {
        this.goToMeetingSetup();
      }, 800);
    });

    const deregisterListModified = this.$rootScope.$on(EventNames.SITE_LIST_MODIFIED, () => this.refreshSiteListData());

    this.rootScopeDeregisters.push(deregisterMeetingSetup, deregisterListModified);
  }

}

export class SiteListComponent implements ng.IComponentOptions {

  public controller = SiteListComponentCtrl;
  public template = require('./site-list.html');

  public bindings = {
    hideLinked: '<',
  };
}
