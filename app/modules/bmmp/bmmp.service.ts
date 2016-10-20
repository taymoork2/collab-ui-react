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
      bmmp.init('', '', this.Authinfo.getOrgId(), 'atlas', this.$translate.use(), '', this.UrlConfig.getBmmpUrl());
    });
  }
}
