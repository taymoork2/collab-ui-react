export class TrialBroadCloudCommonAreaService {

  /* @ngInject */
  constructor(
    private Config,
  ) { }

  private trialData;

  public getData() {
    return this.trialData || this.makeTrial();
  }

  public reset() {
    this.makeTrial();
  }

  private makeTrial() {
    const defaults = {
      type: this.Config.offerTypes.spca,
      enabled: false,
    };

    this.trialData = _.clone(defaults);
    return this.trialData;
  }
}
