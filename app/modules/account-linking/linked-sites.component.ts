import { LinkedSitesService } from './linked-sites.service';
import { IACWebexDomainsResponse, IGotoWebex, IACSiteInfo, LinkingOriginator, LinkingOperation, IACLinkingStatus, IACWebexSiteinfoResponse, LinkingMode } from './account-linking.interface';
import { FeatureToggleService } from 'modules/core/featureToggle';
import { Notification } from 'modules/core/notifications/notification.service';

class LinkedSitesComponentCtrl implements ng.IComponentController {
  public gridApi: uiGrid.IGridApi;
  public sitesInfo: IACSiteInfo[];

  private modeDisplayNameLookup = {};

  public webexSiteLaunchDetails;
  public originator: LinkingOriginator;

  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private LinkedSitesService: LinkedSitesService,
    private FeatureToggleService: FeatureToggleService,
    private Notification: Notification,

  ) {
    this.$log.debug('LinkedSitesComponentCtrl constructor, stateParams:');
  }

  public $onInit = () => {
    this.initModeTranslations();
    this.$log.debug('LinkedSitesComponentCtrl $onInit');

    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasAccountLinkingPhase2).then( (supported) => {
      if (supported === false) {
        this.$log.warn('Illegal state');
      } else {
        this.LinkedSitesService.filterSites().then((sites: IACSiteInfo[]) => {
          this.$log.debug('LinkedSitesService.filterSites, sites = ', sites);
          if (sites.length > 0) {
            this.sitesInfo = sites;
            _.each(this.sitesInfo, (site: IACSiteInfo) => {
              // TODO: Optimize. We probably dont want to fire away too many requests at the same time.
              //       Could be a problem when there are MANY sites...
              this.updateWebexDetailsWhenAvailable(site);
            });

            this.showWizardIfRequired(this.originator);
          } else {
            // TODO: Handle this case in the UI
            this.$log.warn('No linked sites');
          }
        });
      }
    });
  }

  private initModeTranslations() {
    [ LinkingMode.AUTO_AGREEMENT, LinkingMode.AUTO_VERIFY_DOMAIN, LinkingMode.MANUAL, LinkingMode.UNSET ].forEach((mode) => {
      this.modeDisplayNameLookup[mode] = this.$translate.instant('accountLinking.linkingMode.' + mode);
    });
  }

  private updateWebexDetailsWhenAvailable(site: IACSiteInfo) {

    if (!site.webexInfo) {
      return;
    }

    if (site.webexInfo.siteInfoPromise) {
      site.webexInfo.siteInfoPromise.then((si: IACWebexSiteinfoResponse) => {
        // TODO: Other ways to solve this mismatch between WebEx mode empty meaning unset ?
        if (si.accountLinkingMode === '') {
          si.accountLinkingMode = LinkingMode.UNSET;
        }
        site.linkingMode = si.accountLinkingMode;
        site.linkingModeDisplay = this.modeDisplayNameLookup[si.accountLinkingMode];
        site.supportAgreementLinkingMode = si.supportAgreementLinkingMode;
      });
    }
    if (site.webexInfo.ciAccountSyncPromise) {
      site.webexInfo.ciAccountSyncPromise.then((status: IACLinkingStatus) => {
        site.linkingStatus = status;
      });
    }
    if (site.webexInfo.domainsPromise) {
      site.webexInfo.domainsPromise.then((domainBlob: IACWebexDomainsResponse) => {
        site.domains = domainBlob.emailDomains;
      });
    }

  }

  private showWizardIfRequired(originator: LinkingOriginator) {
    this.$log.warn('For now, just select first from the following list:', this.sitesInfo);
    const selectedSiteInfo = this.sitesInfo[0];
    if (originator === LinkingOriginator.Banner && selectedSiteInfo.isSiteAdmin === true) {
      if (this.sitesInfo.length === 1) {
        this.showWizard(selectedSiteInfo);
      } else {
        this.$state.go('site-list.linked', {
          selectedSiteInfo: this.sitesInfo,
          showWizardFn: this.showWizardFn,
          launchWebexFn: this.launchWebexFn,
        });
      }
    }
  }

  public showWizardFn = (siteInfo) => {
    this.showWizard(siteInfo);
  }
  private showWizard = (siteInfo) => {
    const params = {
      siteInfo: siteInfo,
      operation: LinkingOperation.New,
      launchWebexFn: this.launchWebexFn,
      setAccountLinkingModeFn: this.setAccountLinkingModeFn,
    };
    this.$state.go('site-list.linked.details.wizard', params);
  }

  public onSiteSelectedFn = (selectedSiteInfo) => {
    this.$log.debug('site selected:', selectedSiteInfo);
    const params = {
      selectedSiteInfo: selectedSiteInfo,
      showWizardFn: this.showWizardFn,
      launchWebexFn: this.launchWebexFn,
    };
    this.$state.go('site-list.linked.details', params);
  }

  public launchWebexFn = (siteInfo, useHomepage) => {
    this.$log.info('Launch into WebEx');
    this.$log.info('siteInfo:', siteInfo);
    this.$log.info('useHomepage:', useHomepage);
    this.injectSiteinfoInWebexLaunchButton(siteInfo, !useHomepage);
  }

  private getSiteInfoForSite(linkedsiteUrl: string) {
    return _.find( this.sitesInfo, (siteInfo) => {
      return siteInfo.linkedSiteUrl === linkedsiteUrl;
    });
  }
  public setAccountLinkingModeFn = (linkedSiteUrl, mode: LinkingMode) => {
    this.LinkedSitesService.setCiSiteLinking(linkedSiteUrl, mode).then((data: IACWebexSiteinfoResponse) => {
      if (data.accountLinkingMode) {
        //this.$rootScope.$emit('ACCOUNT_LINKING_CHANGE', this.siteInfo, data);
        const selectedSite: IACSiteInfo = this.getSiteInfoForSite(linkedSiteUrl);
        if (selectedSite) {
          selectedSite.linkingMode = mode;
          selectedSite.linkingModeDisplay = this.modeDisplayNameLookup[mode];
        }
      }
      return data;
    }).catch((error) => {
      this.$log.error('error', error);
      this.Notification.error('accountLinking.errors.setAccountLinkingModeError', { message: error.data.errorMsg });
    });
  }

  private injectSiteinfoInWebexLaunchButton(siteInfo, toSiteListPage) {
    this.$log.debug(' injectSiteinfoInWebexLaunchButton', siteInfo);

    this.webexSiteLaunchDetails = <IGotoWebex> {
      siteUrl: siteInfo.linkedSiteUrl,
      toSiteListPage: toSiteListPage,
    };
  }

}

export class LinkedSitesComponent implements ng.IComponentOptions {
  public controller = LinkedSitesComponentCtrl;
  public template = require('./linked-sites.component.html');
  public bindings = {
    originator: '<',
  };
}
