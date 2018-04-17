export class AccountService {
  private static readonly CUSTOMER_CACHE = 'account-service-customer-cache';
  private static readonly CACHE_AGE_DEFAULT = 60 * 60 * 1000;
  private static readonly CACHE_EXPIRE_POLICY = 'passive';
  private customerCache;

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $q: ng.IQService,
    private Authinfo,
    private CacheFactory,
    private UrlConfig,
  ) {
    this.initCache();
  }

  public getAccounts(orgId: string = this.Authinfo.getOrgId()): ng.IPromise<any> {
    if (!orgId) {
      return this.$q.reject('An Organization Id must be passed');
    }
    return this.$http.get(this.customersUrl, {
      cache: this.customerCache,
      params: {
        orgId,
      },
    }).then(response => response.data);
  }

  public updateAuthinfoAccount(orgId: string = this.Authinfo.getOrgId()): ng.IPromise<any> {
    return this.getAccounts(orgId).then(accounts => this.Authinfo.updateAccountInfo(accounts));
  }

  public updateCacheAge(ageInSeconds: number) {
    this.customerCache.setMaxAge(ageInSeconds * 1000);
  }

  public clearCache() {
    this.customerCache.removeAll();
  }

  private get customersUrl() {
    return `${this.UrlConfig.getAdminServiceUrl()}customers`;
  }

  private initCache() {
    this.customerCache = this.CacheFactory.get(AccountService.CUSTOMER_CACHE);
    if (!this.customerCache) {
      this.customerCache = new this.CacheFactory(AccountService.CUSTOMER_CACHE, {
        maxAge: AccountService.CACHE_AGE_DEFAULT,
        deleteOnExpire: AccountService.CACHE_EXPIRE_POLICY,
      });
    }
  }
}
