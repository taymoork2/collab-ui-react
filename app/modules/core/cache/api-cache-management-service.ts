import { HybridServicesExtrasService } from 'modules/hercules/services/hybrid-services-extras.service';
import { USSService } from 'modules/hercules/services/uss.service';

export class ApiCacheManagementService {
  private intervalPromise?: ng.IPromise<void>;
  private readonly INTERVAL_DELAY = 300000;
  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $interval: ng.IIntervalService,
    private $q: ng.IQService,
    private Authinfo,
    private HybridServicesExtrasService: HybridServicesExtrasService,
    private UrlConfig,
    private USSService: USSService,
  ) {}

  /**
   * Use this function to do fast (important!) calls to backend services that can pre-fill caches to make pages in Atlas
   * faster. The APIs these calls use should be asynchronous: return immediately and do their work in a new thread.
   */
  public warmUpOnInterval(): ng.IPromise<void> {
    if (this.intervalPromise) {
      this.$interval.cancel(this.intervalPromise);
    }
    this.warmUpAsynchronousCaches(); // fire one before the first interval delay
    this.intervalPromise = this.$interval(() => this.warmUpAsynchronousCaches(), this.INTERVAL_DELAY);

    return this.intervalPromise;
  }

  public warmUpAsynchronousCaches(): ng.IPromise<void> {
    if (!(this.Authinfo.isAdmin() || this.Authinfo.isReadOnlyAdmin())) {
      return this.$q.resolve();
    }
    const cachePromises: ng.IPromise<any>[] = [];

    // Add urls for other asynchronous caches that should be warmed up here
    cachePromises.push(this.$http.post(`${this.UrlConfig.getCsdmServiceUrl()}/organization/${this.Authinfo.getOrgId()}/preloadCaches`, null));

    return this.$q.all(cachePromises).then(() => {
      return this.$q.resolve();
    }).catch(() => {
      return this.$q.reject();
    });
  }

  /**
   * Use this function to invalidate user caches in hybrid services management microservices. The APIs used for invalidating
   * must be synchronous, i.e. the cache must actually be invalidated when they return.
   */
  public invalidateHybridServicesCaches(): ng.IPromise<void> {

    const cachePromises: ng.IPromise<''>[] = [];

    // Add functions invalidating other hybrid services management microservices that should have their cache invalidated here
    cachePromises.push(this.USSService.invalidateHybridUserCache());
    cachePromises.push(this.HybridServicesExtrasService.invalidateHybridUserCache());

    return this.$q.all(cachePromises)
      .catch(_.noop)
      .then(() => this.$q.resolve());
  }

}
