export class ProPackService {

  public isProPackCustomer: boolean = false;

  /* @ngInject */
  constructor(
    private Authinfo,
    private Config,
    private FeatureToggleService,
    private LicenseService,
    private $q: ng.IQService,
    private $state,
    ) {
    this.LicenseService.getLicensesInOrg(this.$state.params.id)
      .then((licenses) => {
        this.isProPackCustomer = _.some(licenses, license => _.get(license, 'offerCode') === this.Config.offerCodes.MGMTPRO);
      });
  }

  public hasProPackEnabled(): ng.IPromise<boolean> {
    return this.FeatureToggleService.atlasITProPackGetStatus().then(result => {
      return result;
    });
  }

  // any calls to getProPackPurchased outside of the service should be calling hasProPackPurchased instead
  private getProPackPurchased(): ng.IPromise<boolean> {
    return this.FeatureToggleService.atlasITProPackPurchasedGetStatus().then(result => {
      return result;
    });
  }

  // This will be true if the ProPack Toggle and propack is purchased are true
  public hasProPackPurchased(): ng.IPromise<boolean> {
    const promises = {
      proPack: this.hasProPackEnabled(),
      proPackPurchased: this.getProPackPurchased(),
    };
    return this.$q.all(promises).then(result => {
      return (result.proPack && result.proPackPurchased) || this.Authinfo.isPremium();
    });
  }

  // This will be true if the ProPack Toggle is false OR propack is purchased
  public hasProPackPurchasedOrNotEnabled(): ng.IPromise<boolean> {
    const promises = {
      proPack: this.hasProPackEnabled(),
      proPackPurchased: this.getProPackPurchased(),
    };
    return this.$q.all(promises).then(result => {
      return !result.proPack || result.proPackPurchased || this.Authinfo.isPremium();
    });
  }

  //This will be true if the ProPack Toggle is true and the propack is not purchased
  public hasProPackEnabledAndNotPurchased(): ng.IPromise<boolean> {
    const promises = {
      proPack: this.hasProPackEnabled(),
      proPackPurchased: this.getProPackPurchased(),
    };
    return this.$q.all(promises).then(result => {
      return result.proPack && !(result.proPackPurchased || this.Authinfo.isPremium());
    });
  }

  public showProBadgeInHelpDesk(): boolean {
    return this.$state.current.name === 'helpdesk.org' && this.isProPackCustomer;
  }

}
