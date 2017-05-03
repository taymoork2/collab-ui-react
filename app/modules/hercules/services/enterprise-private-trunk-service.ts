import { IConnectorAlarm } from 'modules/hercules/hybrid-services.types';
import { PrivateTrunkService } from 'modules/hercules/private-trunk/private-trunk-services/private-trunk.service';
import { IPrivateTrunkInfo, IPrivateTrunkResource } from 'modules/hercules/private-trunk/private-trunk-services/private-trunk';

export interface IPrivateTrunkResourceWithStatus extends IPrivateTrunkResource {
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
    private PrivateTrunkService: PrivateTrunkService,
    private ServiceDescriptor,
  ) {
  }

  public fetch() {

    let promises = [
      this.PrivateTrunkService.getPrivateTrunk(),
      this.ServiceDescriptor.getServiceStatus('ept'),
    ];
    return this.$q.all(promises)
      .then((results: [IPrivateTrunkInfo, ITrunksFromFMS]) => {
        let trunks: Array<IPrivateTrunkResource> = results[0].resources;
        let service: ITrunksFromFMS = results[1];
        _.map(trunks, (trunk: IPrivateTrunkResourceWithStatus) => {
          const resource = _.find(service.resources, (resource: ITrunkFromFms) => resource.id === trunk.uuid);
          if (resource && resource.state) {
            trunk.serviceStatus = resource.state;
          } else {
            trunk.serviceStatus = 'unknown';
          }
        });
        return trunks;
      })
      .then((trunksWithStatus: Array<IPrivateTrunkResourceWithStatus>) => {
        return _.sortBy(trunksWithStatus, (trunk: { name: string }) => trunk.name);
      })
      .then((sortedTrunks: Array<IPrivateTrunkResourceWithStatus>) => {
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
