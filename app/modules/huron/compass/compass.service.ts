import {
  isEmpty,
  last,
  get,
} from 'lodash';

export class HuronCompassService {
  public baseDomain: string;
  private static readonly SPARK_CALL_BASE_DOMAIN: string = 'sparkCallBaseDomain';

  /* @ngInject */
  constructor(
    private Config,
    private UrlConfig,
    private $http,
  ) {}

  public defaultDomain() {
    if (this.Config.isProd()) {
      return 'huron-dev.com';
    } else {
      return 'huron-int.com';
    }
  }

  public getBaseDomain(): string {
    if (!this.baseDomain) {
      this.baseDomain = this.defaultDomain();
    }
    return this.baseDomain;
  }

  public fetchDomain(authData): string {
    return this.$http({
      method: 'GET',
      url: `${this.UrlConfig.getAdminServiceUrl()}organizations/${authData.orgId}?disableCache=true`,
    })
      .then((res) => {
        if (isEmpty(res.data.orgSettings)) {
          this.baseDomain = this.defaultDomain();
        } else {
          let orgSettings: any = JSON.parse(last<string>(res.data.orgSettings));
          this.baseDomain = get(orgSettings, HuronCompassService.SPARK_CALL_BASE_DOMAIN, this.defaultDomain());
        }
        return authData;
      })
      .catch(() => {
        this.baseDomain = this.defaultDomain();
        return authData;
      });
  }
}
