import { IACSiteInfo, IACLinkingStatus, IACWebexSiteinfoResponse, LinkingMode } from './account-linking.interface';

export class LinkedSitesService {

  private useMockSites: boolean = false;

  /* @ngInject */
  constructor(private $log: ng.ILogService,
              private Authinfo: any,
              private Userservice,
              private LinkedSitesWebExService,
              private LinkedSitesMockService,
              private FeatureToggleService) {
  }

  public init(): void {
  }

  public linkedSitesNotConfigured(): ng.IPromise<boolean> {
    return this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasAccountLinkingPhase2)
      .then( (supports) => {
        if (supports === true) {
          const linkedSites = this.Authinfo.getConferenceServicesWithLinkedSiteUrl();
          return (!!linkedSites && linkedSites.length > 0);
        }
      }).catch( (error) => {
        this.$log.debug('Problems fetching feature toggle: ', error);
        return false;
      });
  }

  public filterSites(): ng.IPromise<IACSiteInfo[]> {
    const sites: IACSiteInfo[] = this.assembleSiteInfo();
    return this.populateIsSiteAdmin(sites).then( () => {
      if (this.useMockSites) {
        this.$log.warn('Adding mock sites');
        return sites.concat(this.LinkedSitesMockService.getMockSites());
      } else {
        return sites;
      }
    }).catch( () => {
      //TODO?: Should the isSiteAdmin field be populated with unknown in this case ?
      return sites;
    });
  }

  private populateIsSiteAdmin(sites: IACSiteInfo[]) {
    const userId = this.Authinfo.getUserId();
    return this.Userservice.getUserAsPromise(userId).then((response) => {
      const adminTrainSiteNames = response.data.adminTrainSiteNames;
      _.each(sites, (site) => {
        site.isSiteAdmin = _.includes(adminTrainSiteNames, site.linkedSiteUrl);
      });
    }).catch( (error) => {
      this.$log.warn('Problems resolving user:', error);
      throw error;
    });
  }

  private assembleSiteInfo(): IACSiteInfo[] {
    const conferenceServicesWithLinkedSiteUrl = this.Authinfo.getConferenceServicesWithLinkedSiteUrl();
    const sites: IACSiteInfo[] = _.map(conferenceServicesWithLinkedSiteUrl, (serviceFeature: any) => {
      return <IACSiteInfo>{
        linkedSiteUrl: serviceFeature.license.linkedSiteUrl,
        webexInfo: {
          siteInfoPromise: this.getSiteInfo(serviceFeature.license.linkedSiteUrl),
          ciAccountSyncPromise: this.getCiAccountSync(serviceFeature.license.linkedSiteUrl),
          domainsPromise: this.getDomains(serviceFeature.license.linkedSiteUrl),
        },
      };
    });
    return sites;
  }

  public setCiSiteLinking(linkedSiteUrl: string, mode: string, domains?: string[]) {
    return this.LinkedSitesWebExService.setCiSiteLinking(linkedSiteUrl, mode, domains);
  }

  public setLinkAllUsers(linkedSiteUrl: string, linkAllUsers: boolean) {
    return this.LinkedSitesWebExService.setLinkAllUsers(linkedSiteUrl, linkAllUsers);
  }

  private getSiteInfo(siteUrl: string): ng.IPromise<IACWebexSiteinfoResponse> {
    return this.LinkedSitesWebExService.getCiSiteLinking(siteUrl).then((si: IACWebexSiteinfoResponse) => {
      this.$log.debug('getSiteInfo', si);
      return si;
    }).catch((error) => {
      this.$log.debug('getSiteInfo error in linked-sites-service:', error);
      // 404 is interpreted as a v1 site
      if (error.status === 404) {
        this.$log.warn(siteUrl + ' does not support v2 API');
        const si: IACWebexSiteinfoResponse = {
          accountLinkingMode: LinkingMode.UNSET,
          enable: false,
          linkAllUsers: false,
          supportAgreementLinkingMode: false,
          trustedDomains: [],
        };
        return si;
      } else {
        this.$log.debug('getSiteInfo error in linked-sites-service:', error);
        throw error;
      }
    });
  }

  private getCiAccountSync(siteUrl: string): ng.IPromise<IACLinkingStatus> {
    return this.LinkedSitesWebExService.getCiAccountSync(siteUrl).then((status: IACLinkingStatus) => {
      this.$log.debug('getCiAccountSync', status);
      return status;
    }).catch((error) => {
      if (error.status === 404) {
        this.$log.warn(siteUrl + ' does not support v2 API');
        return null;
      } else {
        this.$log.debug('getCiAccountSync error in linked-sites-service:', error);
        throw error;
      }
    });
  }

  private getDomains(siteUrl: string): ng.IPromise<any> {
    return this.LinkedSitesWebExService.getDomainsWithRetry(siteUrl).then((domains) => {
      this.$log.debug('LinkedSitesService.getDomains', domains);
      return domains;
    }).catch((error) => {
      if (error.status === 404) {
        this.$log.warn(siteUrl + ' does not support v2 API');
        return null;
      } else {
        this.$log.debug('getDomains error in linked-sites-service:', error);
        throw error;
      }
    });
  }
}
