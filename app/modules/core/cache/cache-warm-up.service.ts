/**
 * Use this service to do fast (important!) calls to backend services that can pre-fill caches to make pages in Atlas
 * faster. The APIs these calls use should be asynchronous: return immediately and do their work in a new thread.
 */
export class CacheWarmUpService {
  private intervalPromise?: ng.IPromise<void>;
  private readonly INTERVAL_DELAY = 100000;
  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $interval: ng.IIntervalService,
    private $q: ng.IQService,
    private Authinfo,
    private UrlConfig,
  ) {}

  public warmUpOnInterval(): ng.IPromise<void> {
    if (this.intervalPromise) {
      this.$interval.cancel(this.intervalPromise);
    }
    this.warmUpCaches(); // fire one before the first interval delay
    this.intervalPromise = this.$interval(() => this.warmUpCaches(), this.INTERVAL_DELAY);

    return this.intervalPromise;
  }

  public warmUpCaches(): ng.IPromise<void> {
    if (!this.Authinfo.isAdmin()) {
      return this.$q.resolve();
    }
    const cachePromises: ng.IPromise<any>[] = [];

    // Add urls for other caches that should be warmed up here
    cachePromises.push(this.$http.post(this.UrlConfig.getCsdmServiceUrl() + `/organization/${this.Authinfo.getOrgId()}/preloadCaches`, null));

    return this.$q.all(cachePromises).then(() => {
      return this.$q.resolve();
    }).catch(() => {
      return this.$q.reject();
    });
  }
}
