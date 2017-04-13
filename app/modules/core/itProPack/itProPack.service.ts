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

  public hasITProPackPurchased(): ng.IPromise<boolean> {
    let promises = {
      proPack: this.hasITProPackEnabled(),
      proPackPurchased: this.FeatureToggleService.atlasITProPackPurchasedGetStatus(),
    };
    return this.$q.all(promises).then(result => {
      return result.proPack && result.proPackPurchased;
    });
  }
}
