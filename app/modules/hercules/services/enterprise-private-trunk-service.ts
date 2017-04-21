import { IConnectorAlarm } from 'modules/hercules/hybrid-services.types';

interface IPrivateTrunkResource {
  url: string;
  resourceId: string;
  name: string;
  address: string;
  port: string;
  serviceStatus: TrunkStatus;
}

export interface ITrunksFromFMS {
  alarmsUrl: string;
  id: string;
  state: TrunkStatus;
  resources: ITrunkFromFms[];
}

export interface ITrunkFromFms {
  id: string;
  state: TrunkStatus;
  type: string;
  destinations: IDestination[];
  alarms: IConnectorAlarm[];
}

export interface IDestination {
  address: string;
  state: TrunkStatus;
}

type TrunkStatus = 'operational' | 'impaired' | 'outage' | 'unknown';

export class EnterprisePrivateTrunkService {

  private trunkCache = [];
  private hub = this.CsdmHubFactory.create();
  public poller = this.CsdmPoller.create(this.fetch.bind(this), this.hub);
  public subscribe = this.hub.on;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private CsdmCacheUpdater,
    private CsdmHubFactory,
    private CsdmPoller,
    private ServiceDescriptor,
  ) { }

  public fetch() {

    const dummyTrunks = [
      {
        url: 'https://giggs.example.org',
        resourceId: 'efc7ebfb-b7a4-42f2-a143-1c056741a03c',
        name: 'CTG Alpha San Jose-E',
        address: 'some.address.goes.here',
        port: '1983',
        serviceStatus: 'halla',
      }, {
        url: 'https://kanchelskis.example.org',
        resourceId: 'e366b1ef-c3c3-414c-9125-5bf76c33df06',
        name: 'CTG Alpha New York-E',
        address: 'other.address.goes.here',
        port: '1984',
        serviceStatus: 'halla',
      }, {
        url: 'https://sharpe.example.org',
        resourceId: '0ce247d8-4de9-482e-ac5a-51b2af1a7929',
        name: 'ACE Beta Seattle',
        address: 'ace.of.base',
        port: '1985',
        serviceStatus: 'halla',
      }, {
        url: 'https://bug.buggy.example.org',
        resourceId: '2d2c9bd4-2e7d-4c3b-b1b9-c7e172c93600',
        name: 'ACE Beta Lysaker',
        address: 'beautiful.life',
        port: '1986',
        serviceStatus: 'halla',
      }];

    let promises = [
      this.$q.resolve(dummyTrunks), // Replace with API call to CMI once ready
      this.ServiceDescriptor.getServiceStatus('ept'),
    ];
    return this.$q.all(promises)
      .then((results: [IPrivateTrunkResource[], ITrunksFromFMS]) => {
        let trunks: IPrivateTrunkResource[] = results[0];
        let service: ITrunksFromFMS = results[1];
        _.map(trunks, (trunk: IPrivateTrunkResource) => {
          const resource = _.find(service.resources, (resource: ITrunkFromFms) => resource.id === trunk.resourceId);
          if (resource && resource.state) {
            trunk.serviceStatus = resource.state;
          } else {
            trunk.serviceStatus = 'unknown';
          }
        });
        return trunks;
      })
      .then((trunksWithStatus) => {
        return _.sortBy(trunksWithStatus, (trunk: { name: string }) => trunk.name);
      })
      .then((sortedTrunks) => {
        this.CsdmCacheUpdater.update(this.trunkCache, sortedTrunks);
        return sortedTrunks;
      });
  }

  public getAllResources() {
    return this.trunkCache;
  }

  public getTrunkFromFMS(trunkId: string) {
    return this.ServiceDescriptor.getServiceStatus('ept')
      .then((trunks: ITrunksFromFMS) => {
        return _.find(trunks.resources, (trunk: any) => trunk.id === trunkId);
      });
  }

  public getTrunkFromCmi(trunkId: string) {
    const dummyTrunks = [
      {
        url: 'https://giggs.example.org',
        resourceId: 'efc7ebfb-b7a4-42f2-a143-1c056741a03c',
        name: 'CTG Alpha San Jose-E',
        address: 'some.address.goes.here',
        port: '1983',
        serviceStatus: 'halla',
      }, {
        url: 'https://kanchelskis.example.org',
        resourceId: 'e366b1ef-c3c3-414c-9125-5bf76c33df06',
        name: 'CTG Alpha New York-E',
        address: 'other.address.goes.here',
        port: '1984',
        serviceStatus: 'halla',
      }, {
        url: 'https://sharpe.example.org',
        resourceId: '0ce247d8-4de9-482e-ac5a-51b2af1a7929',
        name: 'ACE Beta Seattle',
        address: 'ace.of.base',
        port: '1985',
        serviceStatus: 'halla',
      }, {
        url: 'https://bug.buggy.example.org',
        resourceId: '2d2c9bd4-2e7d-4c3b-b1b9-c7e172c93600',
        name: 'ACE Beta Lysaker',
        address: 'beautiful.life',
        port: '1986',
        serviceStatus: 'halla',
      }];
    let trunk = _.find(dummyTrunks, (trunk: any) => trunk.resourceId === trunkId);
    if (trunk) {
      return this.$q.resolve(trunk);
    } else {
      return this.$q.reject('Could not find trunk.');
    }
  }

}
angular
  .module('Hercules')
  .service('EnterprisePrivateTrunkService', EnterprisePrivateTrunkService);
