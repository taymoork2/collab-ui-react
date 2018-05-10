// TODO: this file needs to be revisited to:
// - add missing return types for functions
// - add missing types for function args
// - replace instances of `any` with better TS types as-appropriate
import { SetupWizardService } from 'modules/core/setupWizard/setup-wizard.service';

interface IManagedSite {
  siteUrl: string;
  subscriptionId: string;
}

// TODO: The state fetching and mutation flow go against best practices.
// Need to refactor into pure functions and a loosely coupled api.
export class SiteListService {

  public siteRows: any;
  public managedSites: IManagedSite[];

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $interval: ng.IIntervalService,
    private $log: ng.ILogService,
    private $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private FeatureToggleService,
    private SetupWizardService: SetupWizardService,
    private UrlConfig,
    private Userservice,
    private WebExApiGatewayConstsService,
    private WebExApiGatewayService,
    private WebExUtilsFact,
  ) {
    this.initSiteRowsObj();
  }

  public initSiteRowsObj() {
    this.siteRows = {
      gridData: [],
      gridOptions: {},
    };
  }

  public initSiteRows(dontShowLinkedServices) {
    this.getConferenceServices();
    if (!dontShowLinkedServices) {
      this.getLinkedConferenceServices();
    }
    this.getPendingSiteUrls();
    this.configureGrid();
    this.managedSites = this.getManagedSites();
  }

  public addSiteRow(newSiteRow) {
    this.siteRows.gridData.push(newSiteRow);
  }

  public getSiteRows() {
    return this.siteRows.gridData;
  }

  public getGridOptions() {
    return this.siteRows.gridOptions;
  }

  public getShowGridData() {
    return this.siteRows.showGridData;
  }

  public getSiteRow(siteUrl) {
    return _.find(this.siteRows.gridData, { siteUrl });
  }

  /**
   * Webex site is managed by logged in account.
   */
  public canManageSite(siteUrl: string): boolean {
    // TODO: Remove once data structures are guaranteed to be in sync (i.e Observables)
    if (_.isUndefined(this.managedSites)) {
      this.managedSites = this.getManagedSites();
    }
    return _.some(this.managedSites, (site) => site.siteUrl === siteUrl);
  }

  /**
   * Subscription is managed by logged in account.
   */
  public canManageSubscription(subscriptionId: string): boolean {
    // TODO: Remove once data structures are guaranteed to be in sync (i.e Observables)
    if (_.isUndefined(this.managedSites)) {
      this.managedSites = this.getManagedSites();
    }
    return _.some(this.managedSites, (site) => site.subscriptionId === subscriptionId);
  }

  /**
   * Sites current account has permission to manage (allowSiteManagement).
   */
  public getManagedSites(): IManagedSite[] {
    return _
      .chain(this.Authinfo.getCustomerAccounts())
      .filter((customerAccount) => customerAccount.allowSiteManagement === true)
      .reduce((licenses: any, customer: any) => {
        // Two types of nested subscription payloads exist:
        // legacy order flow uses licenses and current flow uses subscriptions
        if (_.has(customer, 'subscriptions')) {
          return licenses.concat(_.flatMap(customer.subscriptions, 'licenses'));
        }
        if (_.has(customer, 'licenses')) {
          return licenses.concat(_.get(customer, 'licenses', []));
        }
        return licenses;
      }, [])
      .flatMap((license: any) => ({
        siteUrl: license.siteUrl,
        subscriptionId: license.billingServiceId,
      }))
      .filter(site => !_.isUndefined(site.siteUrl))
      .uniqBy('siteUrl')
      .value();
  }

  public isSubscriptionEnterprise(subscription): boolean {
    if (subscription) {
      return this.SetupWizardService.isSubscriptionEnterprise(subscription.billingServiceId);
    } else {
      return !_.isEmpty(this.SetupWizardService.getEnterpriseSubscriptionListWithStatus());
    }
  }

  public stopPolling() {
    this.siteRows.gridData.forEach((siteRow) => {
      if (siteRow.csvPollIntervalObj) {
        this.$interval.cancel(siteRow.csvPollIntervalObj);
      }
    });
  }

  // TODO: Refactor when webex-site-management feature toggle goes GA
  public configureGrid() {
    // Start of grid set up
    this.siteRows.gridOptions = {
      data: this.siteRows.gridData,
      rowHeight: 44,
      columnDefs: [],
    };

    this.siteRows.gridOptions.columnDefs.push({
      field: 'siteUrl',
      displayName: this.$translate.instant('siteList.siteName'),
      width: '25%',
    });

    this.siteRows.gridOptions.columnDefs.push({
      field: 'siteConfLicenses',
      displayName: this.$translate.instant('siteList.licenseTypes'),
      cellTemplate: require('modules/core/siteList/siteLicenseTypesColumn.tpl.html'),
      width: '17%',
    });

    this.siteRows.gridOptions.columnDefs.push({
      field: 'license.billingServiceId',
      displayName: this.$translate.instant('siteList.subscriptionId'),
      width: '15%',
    });

    this.siteRows.gridOptions.columnDefs.push({
      field: 'siteActions',
      displayName: this.$translate.instant('siteList.siteActions'),
      cellTemplate: require('modules/core/siteList/siteActionsColumn.tpl.html'),
    });

    this.updateConferenceServices();
  }

  public getLicensesInSubscriptionGroupedBySites(subscriptionId) {
    return _.groupBy(this.SetupWizardService.getConferenceLicensesBySubscriptionId(subscriptionId), 'siteUrl');
  }

  /**
   * Check that subscriptions exist for adding a Webex site.
   */
  public canAddSite(): boolean {
    return !_.isEmpty(this.SetupWizardService.getNonTrialWebexLicenses()) && !_.isEmpty(this.SetupWizardService.getEnterpriseSubscriptionListWithStatus());
  }

  public hasNonPendingSubscriptions() {
    return _.some(this.SetupWizardService.getEnterpriseSubscriptionListWithStatus(),
     (sub: any) => !sub.isPending);
  }

  // TODO: Convert to pure function
  public getConferenceServices() {
    const conferenceServices = this.Authinfo.getConferenceServicesWithoutSiteUrl();

    if (conferenceServices) {
      conferenceServices.forEach((conferenceService) => {
        const newSiteUrl = conferenceService.license.siteUrl;

        const siteRowExists = _.find(this.siteRows.gridData, {
          siteUrl: newSiteUrl,
          isLinkedSite: false,
        });

        if (!siteRowExists) {
          conferenceService.showCSVInfo = false;
          conferenceService.csvStatusObj = {};
          conferenceService.csvPollIntervalObj = null;
          conferenceService.showCSVIconAndResults = true;

          conferenceService.isIframeSupported = false;
          conferenceService.isAdminReportEnabled = false;
          conferenceService.showSiteLinks = false;
          conferenceService.isError = false;
          conferenceService.isWarn = false;
          conferenceService.isCI = true;
          conferenceService.isLinkedSite = false;
          conferenceService.isCSVSupported = false;
          conferenceService.adminEmailParam = null;
          conferenceService.userEmailParam = null;
          conferenceService.advancedSettings = null;
          conferenceService.webexAdvancedUrl = null;
          conferenceService.siteUrl = newSiteUrl;
          conferenceService.siteAdminUrl = null;
          conferenceService.showLicenseTypes = false;
          conferenceService.multipleWebexServicesLicensed = false;
          conferenceService.licenseTypeContentDisplay = null;
          conferenceService.licenseTypeId = newSiteUrl + '_';
          conferenceService.licenseTooltipDisplay = null;
          conferenceService.licenseAriaLabel = null;
          conferenceService.MCLicensed = false;
          conferenceService.ECLicensed = false;
          conferenceService.SCLicensed = false;
          conferenceService.TCLicensed = false;
          conferenceService.EELicensed = false;
          conferenceService.CMRLicensed = false;

          conferenceService.csvMock = {
            mockStatus: false,
            mockStatusStartIndex: 0,
            mockStatusEndIndex: 0,
            mockStatusCurrentIndex: null,
            mockExport: false,
            mockImport: false,
            mockFileDownload: false,
          };

          this.addSiteRow(conferenceService);
        }
      });
    }
  }

  // TODO: Convert to pure function
  public getLinkedConferenceServices() {
    const linkedConferenceServices = this.Authinfo.getConferenceServicesWithLinkedSiteUrl();

    if (linkedConferenceServices) {
      linkedConferenceServices.forEach((conferenceService) => {
        const newSiteUrl = conferenceService.license.linkedSiteUrl;

        const siteRowExists = _.find(this.siteRows.gridData, {
          siteUrl: newSiteUrl,
          isLinkedSite: true,
        });

        if (!siteRowExists) {
          conferenceService.isLinkedSite = true;
          conferenceService.showLicenseTypes = false;
          conferenceService.siteUrl = newSiteUrl;
          conferenceService.licenseTypeContentDisplay = this.$translate.instant('helpdesk.licenseDisplayNames.linkedSite');
          conferenceService.licenseTooltipDisplay = this.$translate.instant('helpdesk.licenseDisplayNames.linkedSite');
          conferenceService.licenseAriaLabel = this.$translate.instant('helpdesk.licenseDisplayNames.linkedSite');

          this.addSiteRow(conferenceService);
        }
      });
    }
  }

  // TODO: Convert to pure function
  public getPendingSiteUrls() {
    const pendingSubscriptionsServicesPromises = _.map(this.SetupWizardService.getPendingAuthinfoSubscriptions(), (subscription) => {
      return this.getPendingOrderServiceStatusDetails(subscription);
    });
    this.$q.all(pendingSubscriptionsServicesPromises).then((pendingSubscriptionServiceStatusArray) => {
      const pendingSitesInCurrentStatusArray = _.flatMap(pendingSubscriptionServiceStatusArray, (serviceStatuses) => {
        return _.filter(serviceStatuses, (service: any) => {
          return !_.isUndefined(service.license) && !_.isUndefined(service.siteUrl) && service.license.status !== 'PROVISIONED';
        });
      });
      _.forEach(pendingSitesInCurrentStatusArray, (site) => {
        site.isLinkedSite = false;
        site.showLicenseTypes = true;
        site.isPending = true;
        site.licenseTypeContentDisplay = this.$translate.instant('siteList.unavailable');
        site.licenseTooltipDisplay = this.$translate.instant('siteList.licenseUnavailableTooltip');
        site.licenseAriaLabel = this.$translate.instant('siteList.licenseUnavailableTooltip');
        const siteDuplicate: any = _.find(this.siteRows.gridData, { siteUrl: site.siteUrl });
        if (siteDuplicate) {
          siteDuplicate.isPending = true;
        }
      });
      const uniquSites = _.reject(_.uniqBy(pendingSitesInCurrentStatusArray, 'siteUrl'), (site) => {
        return _.some(this.siteRows.gridData, { siteUrl: site.siteUrl });
      });
      _.forEach(uniquSites, (site) => {
        this.addSiteRow(site);
      });
    });
  }

  public getPendingOrderServiceStatusDetails(subscription) {
    const subscriptionId = subscription.externalSubscriptionId;
    const pendingServiceOrderUrl = this.UrlConfig.getAdminServiceUrl() + 'orders/' + subscription.pendingServiceOrderUUID;
    return this.$http.get(pendingServiceOrderUrl).then((response) => {
      const serviceStatus: any[] = _.get(response, 'data.serviceStatus');
      return _.map(serviceStatus, (service) => {
        return {
          siteUrl: service.siteUrl,
          license: {
            billingServiceId: subscriptionId,
            status: service.status,
          },
        };
      });
    });
  }

  public updateConferenceServices() {
    if (!_.isUndefined(this.Authinfo.getPrimaryEmail())) {
      this.updateGridColumns();
    } else {
      this.Userservice.getUser('me', (data) => {
        if (data.success && data.emails) {
          this.Authinfo.setEmails(data.emails);
          this.updateGridColumns();
        }
      });
    }
  }

  public updateGridColumns() {
    this.updateLicenseTypesColumn();
    this.updateActionsColumnForAllRows();
  }

  // TODO: Split this into relevant helper functions and/or service
  public updateLicenseTypesColumn() {
    this.WebExUtilsFact.getAllSitesWebexLicenseInfo().then((allSitesLicenseInfo) => {
      _.filter(this.siteRows.gridData, { isLinkedSite: false })
      .forEach((siteRow: any) => {
        // linked site don't need to process license
        if (siteRow.isLinkedSite) {
          return false;
        }
        const siteUrl = siteRow.license.siteUrl;
        let count = 0;
        siteRow.licenseTooltipDisplay = '';
        siteRow.licenseAriaLabel = '';

        //Get the site's MC, EC, SC, TC, CMR license information
        //MC
        const siteMC = _.filter(allSitesLicenseInfo, {
          webexSite: siteUrl,
          offerCode: 'MC',
        });

        if (
          (siteMC != null) &&
          (siteMC.length > 0)
        ) {
          siteRow.MCLicensed = true;

          siteMC.forEach((mc: any) => {
            //Grid content display
            siteRow.licenseTypeContentDisplay = this.$translate.instant('helpdesk.licenseDisplayNames.' + mc.offerCode, {
              capacity: mc.capacity,
            });

            siteRow.licenseTypeId = siteRow.licenseTypeId + 'MC' + mc.capacity + '-';

            //Tooltip display
            const offerCode = this.$translate.instant('helpdesk.licenseDisplayNames.' + mc.offerCode, {
              capacity: mc.capacity,
            });
            siteRow.licenseTooltipDisplay += '<br>' + offerCode;
            siteRow.licenseAriaLabel += ' ' + offerCode;

            count += 1;
          });
        } else {
          siteRow.MCLicensed = false;
        }

        //EE
        const siteEE = _.filter(allSitesLicenseInfo, {
          webexSite: siteUrl,
          offerCode: 'EE',
        });

        if (
          (siteEE != null) &&
          (siteEE.length > 0)
        ) {
          siteRow.EELicensed = true;

          siteEE.forEach((ee: any) => {
            //Grid content display
            siteRow.licenseTypeContentDisplay = this.$translate.instant('helpdesk.licenseDisplayNames.' + ee.offerCode, {
              capacity: ee.capacity,
            });

            siteRow.licenseTypeId = siteRow.licenseTypeId + 'EE' + ee.capacity + '-';

            //Tooltip display
            const offerCode = this.$translate.instant('helpdesk.licenseDisplayNames.' + ee.offerCode, {
              capacity: ee.capacity,
            });
            siteRow.licenseTooltipDisplay += '<br>' + offerCode;
            siteRow.licenseAriaLabel += ' ' + offerCode;

            count += 1;
          });
        } else {
          siteRow.EELicensed = false;
        }

        //CMR
        const siteCMR = _.filter(allSitesLicenseInfo, {
          webexSite: siteUrl,
          offerCode: 'CMR',
        });

        if (
          (siteCMR != null) &&
          (siteCMR.length > 0)
        ) {
          siteRow.CMRLicensed = true;

          siteCMR.forEach((cmr: any) => {
            //Grid content display
            siteRow.licenseTypeContentDisplay = this.$translate.instant('helpdesk.licenseDisplayNames.' + cmr.offerCode, {
              capacity: cmr.capacity,
            });

            siteRow.licenseTypeId = siteRow.licenseTypeId + 'CMR' + cmr.capacity + '-';

            //Tooltip display
            const offerCode = this.$translate.instant('helpdesk.licenseDisplayNames.' + cmr.offerCode, {
              capacity: cmr.capacity,
            });
            siteRow.licenseTooltipDisplay += '<br>' + offerCode;
            siteRow.licenseAriaLabel += ' ' + offerCode;

            count += 1;
          });
        } else {
          siteRow.CMRLicensed = false;
        }

        //EC
        const siteEC = _.filter(allSitesLicenseInfo, {
          webexSite: siteUrl,
          offerCode: 'EC',
        });

        if (
          (siteEC != null) &&
          (siteEC.length > 0)
        ) {
          siteRow.ECLicensed = true;

          siteEC.forEach((ec: any) => {
            //Grid content display
            siteRow.licenseTypeContentDisplay = this.$translate.instant('helpdesk.licenseDisplayNames.' + ec.offerCode, {
              capacity: ec.capacity,
            });

            siteRow.licenseTypeId = siteRow.licenseTypeId + 'EC' + ec.capacity + '-';

            //Tooltip display
            const offerCode = this.$translate.instant('helpdesk.licenseDisplayNames.' + ec.offerCode, {
              capacity: ec.capacity,
            });
            siteRow.licenseTooltipDisplay += '<br>' + offerCode;
            siteRow.licenseAriaLabel += ' ' + offerCode;

            count += 1;
          });
        } else {
          siteRow.ECLicensed = false;
        }

        //SC
        const siteSC = _.filter(allSitesLicenseInfo, {
          webexSite: siteUrl,
          offerCode: 'SC',
        });

        if (
          (siteSC != null) &&
          (siteSC.length > 0)
        ) {
          siteRow.SCLicensed = true;

          siteSC.forEach((sc: any) => {
            //Grid content display
            siteRow.licenseTypeContentDisplay = this.$translate.instant('helpdesk.licenseDisplayNames.' + sc.offerCode, {
              capacity: sc.capacity,
            });

            siteRow.licenseTypeId = siteRow.licenseTypeId + 'SC' + sc.capacity + '-';

            //Tooltip display
            const offerCode = this.$translate.instant('helpdesk.licenseDisplayNames.' + sc.offerCode, {
              capacity: sc.capacity,
            });
            siteRow.licenseTooltipDisplay += '<br>' + offerCode;
            siteRow.licenseAriaLabel += ' ' + offerCode;

            count += 1;
          });
        } else {
          siteRow.SCLicensed = false;
        }

        //TC
        const siteTC = _.filter(allSitesLicenseInfo, {
          webexSite: siteUrl,
          offerCode: 'TC',
        });

        if (
          (siteTC != null) &&
          (siteTC.length > 0)
        ) {
          siteRow.TCLicensed = true;

          siteTC.forEach((tc: any) => {
            //Grid content display
            siteRow.licenseTypeContentDisplay = this.$translate.instant('helpdesk.licenseDisplayNames.' + tc.offerCode, {
              capacity: tc.capacity,
            });

            siteRow.licenseTypeId = siteRow.licenseTypeId + 'TC' + tc.capacity + '-';

            //Tooltip display
            const offerCode = this.$translate.instant('helpdesk.licenseDisplayNames.' + tc.offerCode, {
              capacity: tc.capacity,
            });
            siteRow.licenseTooltipDisplay += '<br>' + offerCode;
            siteRow.licenseAriaLabel += ' ' + offerCode;

            count += 1;
          });
        } else {
          siteRow.TCLicensed = false;
        }

        siteRow.licenseTypeId = siteRow.licenseTypeId + 'license';

        if (count > 1) {
          siteRow.multipleWebexServicesLicensed = true;
          siteRow.licenseTypeContentDisplay = this.$translate.instant('siteList.multipleLicenses');
          siteRow.licenseTooltipDisplay = _.replace(siteRow.licenseTooltipDisplay, '<br>', '');
        } else if (count === 1) {
          siteRow.multipleWebexServicesLicensed = false;
          siteRow.licenseTooltipDisplay = null;
          siteRow.licenseAriaLabel = null;
        } else if (siteRow.isPending) {
          siteRow.licenseTooltipDisplay = this.$translate.instant('siteList.licenseUnavailableTooltip');
          siteRow.licenseAriaLabel = this.$translate.instant('siteList.licenseUnavailableTooltip');
        }

        siteRow.showLicenseTypes = true;
      });
    });
  }

  public updateActionsColumnForAllRows() {
    _.filter(this.siteRows.gridData, {
      isLinkedSite: false,
    }).forEach((siteRow) => {
      this.updateActionsColumnForOneRow(siteRow);
    });
  }

  public updateActionsColumnForOneRow(siteRow) {
    siteRow.adminEmailParam = this.Authinfo.getPrimaryEmail();
    siteRow.userEmailParam = this.Authinfo.getPrimaryEmail();
    siteRow.advancedSettings = this.UrlConfig.getWebexAdvancedEditUrl(siteRow.siteUrl);
    siteRow.webexAdvancedUrl = this.UrlConfig.getWebexAdvancedHomeUrl(siteRow.siteUrl);

    const siteUrl = siteRow.siteUrl;

    const isCISite = this.WebExUtilsFact.isCIEnabledSite(siteUrl);

    siteRow.siteAdminUrl = this.WebExUtilsFact.getSiteAdminUrl(siteUrl);
    siteRow.isCI = isCISite;

    this.WebExApiGatewayService.siteFunctions(siteUrl).then((result) => {
      siteRow.isIframeSupported = result.isIframeSupported;
      siteRow.isAdminReportEnabled = result.isAdminReportEnabled;
      siteRow.isCSVSupported = result.isCSVSupported;

      siteRow.showSiteLinks = true;

      if (!siteRow.isCSVSupported || !siteRow.showCSVIconAndResults) {
        // no further data to get
        siteRow.showCSVInfo = true;
        return;
      }

      this.updateCSVStatusInRow(siteRow.siteUrl);

      // start CSV status poll
      const pollInterval = 30000; // 30sec (15000 is 15sec; 3600000 is 1hr;)
      siteRow.csvPollIntervalObj = this.$interval(() => {
        this.updateCSVStatusInRow(siteRow.siteUrl);
      }, pollInterval);
    }, (response) => {
      siteRow.isIframeSupported = false;
      siteRow.isAdminReportEnabled = false;
      siteRow.showSiteLinks = true;
      siteRow.showCSVInfo = true;
      siteRow.isError = true;

      if (response.response.indexOf('030048') !== -1) {
        siteRow.isWarn = true;
      }
    });
  }

  public updateCSVStatusInRow(siteUrl) {
    const siteRow: any = this.getSiteRow(siteUrl);
    let mockCsvStatusReq = null;

    if (siteRow.csvMock && siteRow.csvMock.mockStatus) {
      if (!siteRow.csvMock.mockStatusCurrentIndex) {
        siteRow.csvMock.mockStatusCurrentIndex = siteRow.csvMock.mockStatusStartIndex;
      }

      mockCsvStatusReq = this.WebExApiGatewayConstsService.csvStatusTypes[siteRow.csvMock.mockStatusCurrentIndex];
      ++siteRow.csvMock.mockStatusCurrentIndex;

      if (
        (this.WebExApiGatewayConstsService.csvStatusTypes.length <= siteRow.csvMock.mockStatusCurrentIndex) ||
        (siteRow.csvMock.mockStatusEndIndex < siteRow.csvMock.mockStatusCurrentIndex)
      ) {
        siteRow.csvMock.mockStatusCurrentIndex = siteRow.csvMock.mockStatusStartIndex;
      }
    }

    this.WebExApiGatewayService.csvStatus(
      siteRow.siteUrl,
      siteRow.csvMock.mockStatus,
      mockCsvStatusReq,
    ).then((response) => {
      // save the response obj into the siteRow obj... when get result (for completed job) is clicked,
      // we will need  more information from the response obj
      siteRow.csvStatusObj = response;
      siteRow.asyncErr = false;

      this.updateDisplayControlFlagsInRow(siteRow);
    }, (response) => {
      if (response.errorId === '060502') {
        // TODO: restore this after CSCvd83672 is deployed to WebEx production
        // - see also: https://jira-eng-chn-sjc1.cisco.com/jira/projects/ATLAS/issues/ATLAS-2022
        // $log.log("Redirect to login...");
        // Auth.redirectToLogin();
        this.$log.log('Redirect to login (disabled)...');
        siteRow.csvStatusObj = response;
      } else {
        siteRow.csvStatusObj = response;
        siteRow.showCSVInfo = false;
      }
    });
  }

  public updateDisplayControlFlagsInRow(siteRow) {
    siteRow.showCSVInfo = true;
  }

  // TODO: Remove after site-management is GA
  public useSiteManagement(): ng.IPromise<boolean> {
    return this.FeatureToggleService.supports('atlas-webex-site-management-setting');
  }

}
