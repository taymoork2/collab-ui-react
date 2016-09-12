export class BmmpService  {
  /* @ngInject */
  constructor(
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private UrlConfig
  ) {}

  public init(): void {
    this.$timeout(() => {
      bmmp.init(null, null, this.Authinfo.getOrgId(), 'atlas', this.$translate.use(), null, this.UrlConfig.getBmmpUrl());
    });
  }
}