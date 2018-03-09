import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';

interface ISelectOption {
  label: string;
  value: string;
}

export class HybridMediaReleaseChannelService {

  /* @ngInject */
  constructor(
    private HybridServicesClusterService: HybridServicesClusterService,
  ) { }

  public saveReleaseChannel(clusterId: string, releaseChannelSelected: ISelectOption): ng.IPromise<any> {
    return this.HybridServicesClusterService.setClusterInformation(clusterId, { releaseChannel: releaseChannelSelected.value });
  }

}
