import { IACSiteInfo, LinkingMode, IACLinkingStatus, IACWebexSiteinfoResponse } from './account-linking.interface';

export class LinkedSitesMockService {

  /* @ngInject */
  constructor(
    private $timeout: ng.ITimeoutService) {
  }
  private domains: string[] = [
    'abc.com',
    'zyz.com',
  ];
  private domains_many: string[] = [
    'abc1.com', 'zyz2.com',
    'abc3.com', 'abc4.com',
    'zyz5.com', 'abc6.com',
    'zyz7.com', 'abc8.com',
    'zyz9.com', 'abc10.com',
    'abc11.com', 'zyz12.com',
    'abc13.com', 'abc14.com',
    'zyz15.com', 'abc16.com',
    'zyz17.com', 'abc18.com',
    'zyz19.com', 'abc20.com',
    'zyz21.com', 'abc22.com',
  ];

  public getMockSites(): IACSiteInfo[] {
    return [
      {
        linkedSiteUrl: 'mock1.webex.com_NOT_SITE_ADMIN',
        webexInfo: {
          ciAccountSyncPromise: this.$timeout( () => {
            return <IACLinkingStatus>{
              accountsLinked: 100,
              totalWebExAccounts: 312,
            };
          }, 4000),
          domainsPromise: this.$timeout( () => {
            return { emailDomains: this.domains };
          }, 20000),
          siteInfoPromise: this.$timeout( () => {
            return <IACWebexSiteinfoResponse> {
              accountLinkingMode: LinkingMode.AUTO_AGREEMENT,
              supportAgreementLinkingMode: true,
            };
          }, 2000),
        },
        isSiteAdmin: false,
        domains: [],
      },
      {
        linkedSiteUrl: 'mock2.webex.com_NOT_SITE_ADMIN',
        webexInfo: {
          ciAccountSyncPromise: this.$timeout( () => {
            return <IACLinkingStatus> {
              accountsLinked: 20,
              totalWebExAccounts: 30,
            };
          }, 4000),
          domainsPromise: this.$timeout( () => {
            return { emailDomains: this.domains };
          }, 6000),
          siteInfoPromise: this.$timeout( () => {
            return <IACWebexSiteinfoResponse> {
              accountLinkingMode: LinkingMode.MANUAL,
              supportAgreementLinkingMode: true,
            };
          }, 3000),
        },
        isSiteAdmin: false,
        domains: [],
      },
      {
        linkedSiteUrl: 'mock3.webex.com',
        webexInfo: {
          ciAccountSyncPromise: this.$timeout(() => {
            return <IACLinkingStatus>{
              accountsLinked: 42,
              totalWebExAccounts: 110,
            };
          }, 5000),
          domainsPromise: this.$timeout( () => {
            return { emailDomains: this.domains };
          }, 10000),
          siteInfoPromise: this.$timeout( () => {
            return <IACWebexSiteinfoResponse> {
              accountLinkingMode: LinkingMode.AUTO_VERIFY_DOMAIN,
              supportAgreementLinkingMode: true,
            };
          }, 2000),
        },
        isSiteAdmin: true,
        domains: [],
      },
      {
        linkedSiteUrl: 'mock4.webex.com',
        webexInfo: {
          ciAccountSyncPromise: this.$timeout(() => {
            return <IACLinkingStatus> {
              accountsLinked: 50,
              totalWebExAccounts: 210,
            };
          }, 1000),
          domainsPromise: this.$timeout( () => {
            return { emailDomains: this.domains };
          }, 9000),
          siteInfoPromise: this.$timeout( () => {
            return <IACWebexSiteinfoResponse> {
              accountLinkingMode: LinkingMode.AUTO_VERIFY_DOMAIN,
              supportAgreementLinkingMode: true,
            };
          }, 2000),
        },
        isSiteAdmin: true,
        domains: [],
      },
      {
        linkedSiteUrl: 'mock5_many_domains.webex.com',
        webexInfo: {
          ciAccountSyncPromise: this.$timeout(() => {
            return <IACLinkingStatus>{
              state: 'completed',
              accountsLinked: 100,
              totalWebExAccounts: 100,
            };
          }, 5000),
          domainsPromise: this.$timeout( () => {
            return { emailDomains: this.domains_many };
          }, 10000),
          siteInfoPromise: this.$timeout( () => {
            return <IACWebexSiteinfoResponse> {
              accountLinkingMode: LinkingMode.MANUAL,
              supportAgreementLinkingMode: true,
            };
          }, 1000),
        },
        isSiteAdmin: true,
        domains: [],
      },
      {
        linkedSiteUrl: 'mock6_unset',
        webexInfo: {
          ciAccountSyncPromise: this.$timeout(() => {
            return <IACLinkingStatus>{
              state: 'idle?',
              accountsLinked: 0,
              totalWebExAccounts: 0,
            };
          }, 2000),
          domainsPromise: this.$timeout( () => {
            return { emailDomains: [] };
          }, 20000),
          siteInfoPromise: this.$timeout( () => {
            return <IACWebexSiteinfoResponse> {
              accountLinkingMode: LinkingMode.UNSET,
              supportAgreementLinkingMode: false,
            };
          }, 1000),
        },
        isSiteAdmin: true,
        domains: [],
      },
      { // TODO: How to simulate 'old' api...
        linkedSiteUrl: 'mock7_not_supporting_new_api',
        webexInfo: {
          ciAccountSyncPromise: this.$timeout(() => {
            return <IACLinkingStatus>{
              state: 'XXX?',
              accountsLinked: 0,
              totalWebExAccounts: 0,
            };
          }, 2000),
          domainsPromise: this.$timeout( () => {
            return { };
          }, 20000),
          siteInfoPromise: this.$timeout( () => {
            return <IACWebexSiteinfoResponse> {
              accountLinkingMode: LinkingMode.UNSET,
              supportAgreementLinkingMode: false,
            }; // TODO: dont return enything because it's unsupported ???
          }, 1000),
        },
        isSiteAdmin: true,
        domains: [],
      },
    ];
  }
}
