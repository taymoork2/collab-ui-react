export interface IPrivateTrunk {
  url: string;
  resources: IPrivateTrunkResource[];
}

export interface IPrivateTrunkResource {
  url: string;
  resourceId: string;
  name: string;
  address: string;
  port: string;
}

export class EnterprisePrivateTrunkService {

  private trunkCache = [];
  private hub = this.CsdmHubFactory.create();
  public poller = this.CsdmPoller.create(this.fetch.bind(this), this.hub);
  public subscribe = this.hub.on;

  /* @ngInject */
  constructor(
    private $q,
    private CsdmCacheUpdater,
    private CsdmHubFactory,
    private CsdmPoller,
  ) { }

  public fetch() {
    this.CsdmCacheUpdater.update(this.trunkCache, [{
      url: 'https://giggs.example.org',
      resourceId: 'efc7ebfb-b7a4-42f2-a143-1c056741a03c',
      name: 'CTG Alpha San Jose-E',
      address: 'some.address.goes.here',
      port: '1983',
      aggregates: {
        state: 'connected',
      },
      serviceStatus: 'halla',
    }, {
      url: 'https://kanchelskis.example.org',
      resourceId: 'e366b1ef-c3c3-414c-9125-5bf76c33df06',
      name: 'CTG Alpha New York-E',
      address: 'other.address.goes.here',
      port: '1984',
      aggregates: {
        state: 'connected',
      },
      serviceStatus: 'halla',
    }]);
    return this.$q.resolve(this.trunkCache);
  }

  public getAllResources() {
    return this.trunkCache;
  }

}
angular
  .module('Hercules')
  .service('EnterprisePrivateTrunkService', EnterprisePrivateTrunkService);
