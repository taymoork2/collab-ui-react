import { IConnectorAlarm } from 'modules/hercules/hybrid-services.types';
import { PrivateTrunkService } from 'modules/hercules/private-trunk/private-trunk-services/private-trunk.service';
import { IPrivateTrunkInfo, IPrivateTrunkResource } from 'modules/hercules/private-trunk/private-trunk-services/private-trunk';
import { CsdmHubFactory, CsdmPollerFactory } from 'modules/squared/devices/services/CsdmPoller';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';

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

  private trunkCache: IPrivateTrunkResourceWithStatus[] = [];
  private hub = this.CsdmHubFactory.create();
  public poller = this.CsdmPoller.create(this.fetch.bind(this), this.hub);
  public subscribe = this.hub.on;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private CsdmHubFactory: CsdmHubFactory,
    private CsdmPoller: CsdmPollerFactory,
    private PrivateTrunkService: PrivateTrunkService,
    private ServiceDescriptorService: ServiceDescriptorService,
  ) {
  }

  public fetch() {
    // TODO: handle 404 to say that setup === false
    const promises: ng.IPromise<any>[] = [
      this.PrivateTrunkService.getPrivateTrunk(),
      this.ServiceDescriptorService.getServiceStatus('ept'),
    ];
    return this.$q.all(promises)
      .then((results: [IPrivateTrunkInfo, IServiceStatus]) => {
        const trunks: IPrivateTrunkResource[] = results[0].resources;
        const serviceStatus: IServiceStatus = results[1];
        return _.map(trunks, (trunk) => {
          const resource = _.find(serviceStatus.resources, (resource: ITrunkStatus) => resource.id === trunk.uuid);
          const updatedTrunk: IPrivateTrunkResourceWithStatus = _.extend({}, trunk, {
            status: resource || <ITrunkStatus>{ id: trunk.uuid, state: 'unknown', type: 'trunk', destinations: [], alarms: [] },
          });
          return updatedTrunk;
        });
      })
      .then((trunksWithStatus) => {
        return _.sortBy(trunksWithStatus, (trunk) => trunk.name);
      })
      .then((sortedTrunks) => {
        this.trunkCache = sortedTrunks;
        return sortedTrunks;
      });
  }

  public getAllResources(): IPrivateTrunkResourceWithStatus[] {
    return _.values(this.trunkCache);
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
export default angular
  .module('hercules.enterprise-private-trunk-service', [
    require('modules/squared/devices/services/CsdmCacheUpdater'),
    require('modules/squared/devices/services/CsdmPoller'),
    require('modules/hercules/private-trunk/private-trunk-services').default,
    require('modules/hercules/services/service-descriptor.service').default,
  ])
  .service('EnterprisePrivateTrunkService', EnterprisePrivateTrunkService)
  .name;
