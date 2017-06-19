export class ITProPackService {

  /* @ngInject */
  constructor(
    private FeatureToggleService,
    private $q: ng.IQService,
    ) {}

  public hasITProPackEnabled(): ng.IPromise<boolean> {
    return this.FeatureToggleService.atlasITProPackGetStatus().then(result => {
      return result;
    });
  }

  public getITProPackPurchased(): ng.IPromise<boolean> {
    return this.FeatureToggleService.atlasITProPackPurchasedGetStatus().then(result => {
      return result;
    });
  }

  // This will be true if the ProPack Toggle and propack is purchased are true
  public hasITProPackPurchased(): ng.IPromise<boolean> {
    const promises = {
      proPack: this.hasITProPackEnabled(),
      proPackPurchased: this.getITProPackPurchased(),
    };
    return this.$q.all(promises).then(result => {
      return result.proPack && result.proPackPurchased;
    });
  }

  // This will be true if the ProPack Toggle is false OR propack is purchased
  public hasITProPackPurchasedOrNotEnabled(): ng.IPromise<boolean> {
    const promises = {
      proPack: this.hasITProPackEnabled(),
      proPackPurchased: this.getITProPackPurchased(),
    };
    return this.$q.all(promises).then(result => {
      return !result.proPack || result.proPackPurchased;
    });
  }

  //This will be true if the ProPack Toggle is true and the propack is not purchased
  public hasITProPackEnabledAndNotPurchased(): ng.IPromise<boolean> {
    const promises = {
      proPack: this.hasITProPackEnabled(),
      proPackPurchased: this.getITProPackPurchased(),
    };
    return this.$q.all(promises).then(result => {
      return result.proPack && !result.proPackPurchased;
    });
  }

}
