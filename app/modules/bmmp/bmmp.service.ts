import { Config } from 'modules/core/config/config';

export class BmmpService  {
  /* @ngInject */
  constructor(
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private Config: Config,
    private SessionStorage,
    private StorageKeys,
  ) {}

  public init(): void {
    this.$timeout(() => {
      bmmp.init('', '', this.Authinfo.getUserId(), 'atlas', this.$translate.use(), '', this.getBmmpUrl());
    });
  }

  private bmmpUrl: Object = {
    dev: 'https://bmmp.dmz.ciscospark.com/api/v1',
    cfe: 'https://bmmp.dmz.ciscospark.com/api/v1',
    integration: 'https://bmmp.dmz.ciscospark.com/api/v1',
    prod: 'https://bmmp.ciscospark.com/api/v1',
    dmz: 'https://bmmp.dmz.ciscospark.com/api/v1',
    ats: 'https://bmmpats.ciscospark.com/api/v1',
    bts: 'https://bmmpbts.ciscospark.com/api/v1',
  };

  private getBmmpUrl(): string {
    let url = '';
    const bmmpEnv = this.SessionStorage.get(this.StorageKeys.BMMP_ENV);
    if (bmmpEnv && _.has(this.bmmpUrl, bmmpEnv)) {
      url = this.bmmpUrl[bmmpEnv];
    } else {
      url = this.bmmpUrl[this.Config.getEnv()];
    }

    return url;
  }
}
