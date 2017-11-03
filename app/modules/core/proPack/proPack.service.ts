export class ProPackService {

  public isProPackCustomer: boolean = false;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private Authinfo,
    private FeatureToggleService,
    ) {
  }

  public hasProPackEnabled(): ng.IPromise<boolean> {
    return this.FeatureToggleService.atlasITProPackGetStatus();
  }

  // any calls to getProPackPurchased outside of the service should be calling hasProPackPurchased instead
  private getProPackPurchased(): ng.IPromise<boolean> {
    return this.FeatureToggleService.atlasITProPackPurchasedGetStatus();
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

  public showProBadge(): boolean {
    return this.Authinfo.isEnterpriseCustomer() && this.Authinfo.isPremium();
  }
}
