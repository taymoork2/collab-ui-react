import { IConnectorAlarm } from 'modules/hercules/hybrid-services.types';
import { PrivateTrunkService } from 'modules/hercules/private-trunk/private-trunk-services/private-trunk.service';
import { IPrivateTrunkInfo, IPrivateTrunkResource } from 'modules/hercules/private-trunk/private-trunk-services/private-trunk';

export interface IPrivateTrunkResourceWithStatus extends IPrivateTrunkResource {
  status: ITrunkStatus;
}

export interface IServiceStatus {
  alarmsUrl: string;
  id: string;
  state: StatusEnum;
  resources: ITrunkStatus[];
}

export interface ITrunkStatus {
  id: string;
  state: StatusEnum;
  type: string;
  destinations: IDestination[];
  alarms: IConnectorAlarm[];
}

export interface IDestination {
  address: string;
  state: StatusEnum;
}

type StatusEnum = 'operational' | 'impaired' | 'outage' | 'unknown';

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
    private PrivateTrunkService: PrivateTrunkService,
    private ServiceDescriptor,
  ) {
  }

  public fetch() {
    const promises = [
      this.PrivateTrunkService.getPrivateTrunk(),
      this.ServiceDescriptor.getServiceStatus('ept'),
    ];
    return this.$q.all(promises)
      .then((results: [IPrivateTrunkInfo, IServiceStatus]) => {
        const trunks: IPrivateTrunkResource[] = results[0].resources;
        const serviceStatus: IServiceStatus = results[1];
        return _.map(trunks, (trunk: IPrivateTrunkResourceWithStatus) => {
          const resource = _.find(serviceStatus.resources, (resource: ITrunkStatus) => resource.id === trunk.uuid);
          trunk.status = resource || { id: trunk.uuid, state: 'unknown', type: 'trunk', destinations: [], alarms: [] };
          return trunk;
        });
      })
      .then((trunksWithStatus: IPrivateTrunkResourceWithStatus[]) => {
        return _.sortBy(trunksWithStatus, (trunk: { name: string }) => trunk.name);
      })
      .then((sortedTrunks: IPrivateTrunkResourceWithStatus[]) => {
        this.CsdmCacheUpdater.update(this.trunkCache, sortedTrunks);
        return sortedTrunks;
      });
  }

  public getAllResources() {
    return this.trunkCache;
  }

  public getTrunk(trunkId: string) {
    return _.find(this.trunkCache,  (trunk: IPrivateTrunkResource) => {
      return trunk.uuid === trunkId;
    });
  }

  public getTrunkFromCmi(trunkId: string) {
    return this.PrivateTrunkService.getPrivateTrunk()
      .then((trunks: IPrivateTrunkInfo) => {
        return _.find(trunks.resources, (trunk: IPrivateTrunkResource) => {
          return trunk.uuid === trunkId;
        });
      });
  }

}
angular
  .module('Hercules')
  .service('EnterprisePrivateTrunkService', EnterprisePrivateTrunkService);
