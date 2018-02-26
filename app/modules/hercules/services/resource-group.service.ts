import { ConnectorType, ICluster, IResourceGroup, IReleaseChannelsResponse } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';

export interface IResourceGroupOptionPair {
  label: string;
  value: string;
}
type EmptyHTTPResponse = '';

export class ResourceGroupService {
  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private HybridServicesClusterService: HybridServicesClusterService,
    private UrlConfig,
  ) {
    this.extractDataFromResponse = this.extractDataFromResponse.bind(this);
    this.extractGroupsFromResponse = this.extractGroupsFromResponse.bind(this);
  }

  public get(resourceGroupId: string, orgId?: string): ng.IPromise<IResourceGroup> {
    return this.$http
      .get<IResourceGroup>(`${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/resourceGroups/${resourceGroupId}`)
      .then(this.extractDataFromResponse);
  }

  public getAll(orgId?: string): ng.IPromise<IResourceGroup[]> {
    return this.$http
      .get<IResourceGroup>(`${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/resourceGroups`)
      .then(this.extractGroupsFromResponse);
  }

  public create(name: string, releaseChannel: string, orgId?: string): ng.IPromise<EmptyHTTPResponse> {
    return this.$http
      .post<EmptyHTTPResponse>(`${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/resourceGroups`, {
        name,
        releaseChannel,
      })
      .then(this.extractDataFromResponse)
      .then((res) => {
        this.HybridServicesClusterService.clearCache();
        return res;
      });
  }

  public remove(resourceGroupId: string, orgId?: string): ng.IPromise<EmptyHTTPResponse> {
    return this.$http.delete<EmptyHTTPResponse>(`${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/resourceGroups/${resourceGroupId}`)
      .then(this.extractDataFromResponse)
      .then((res) => {
        this.HybridServicesClusterService.clearCache();
        return res;
      });
  }

  public setName(resourceGroupId: string, name: string, orgId?: string): ng.IPromise<EmptyHTTPResponse> {
    return this.$http
      .patch<EmptyHTTPResponse>(`${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/resourceGroups/${resourceGroupId}`, {
        name: name,
      })
      .then(this.extractDataFromResponse)
      .then((res) => {
        this.HybridServicesClusterService.clearCache();
        return res;
      });
  }

  public setReleaseChannel(resourceGroupId: string, releaseChannel: string, orgId?: string): ng.IPromise<EmptyHTTPResponse> {
    return this.$http
      .patch<EmptyHTTPResponse>(`${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/resourceGroups/${resourceGroupId}`, {
        releaseChannel,
      })
      .then(this.extractDataFromResponse)
      .then((res) => {
        this.HybridServicesClusterService.clearCache();
        return res;
      });
  }

  public getAllowedChannels(orgId?: string): ng.IPromise<string[]> {
    return this.$http
      .get<IReleaseChannelsResponse>(`${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/channels`)
      .then(this.extractDataFromResponse)
      .then((data: IReleaseChannelsResponse) => {
        const allowedChannels: string[] = [];
        _.forEach(data.releaseChannels, channel => {
          if (channel.entitled) {
            allowedChannels.push(channel.channel);
          }
        });
        return allowedChannels;
      });
  }

  public assign(clusterId, resourceGroupId, orgId?): ng.IPromise<EmptyHTTPResponse> {
    return this.$http.patch<EmptyHTTPResponse>(`${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/clusters/${clusterId}`, {
      resourceGroupId,
    })
      .then(this.extractDataFromResponse);
  }

  public getAllAsOptions(orgId?): ng.IPromise<IResourceGroupOptionPair[]> {
    return this.getAll(orgId || this.Authinfo.getOrgId())
      .then(groups => {
        const options: IResourceGroupOptionPair[] = _.map(groups, (group) => {
          return {
            label: group.name + (group.releaseChannel ? ' (' + this.$translate.instant('hercules.fusion.add-resource-group.release-channel.' + group.releaseChannel) + ')' : ''),
            value: group.id,
          };
        });
        return options;
      });
  }

  public resourceGroupHasEligibleCluster(resourceGroupId: string, connectorType: ConnectorType): ng.IPromise<boolean> {
    return this.HybridServicesClusterService.getAll()
      .then(clusters => {
        let clustersInGroup: ICluster[];
        if (resourceGroupId !== '') {
          clustersInGroup = this.HybridServicesClusterService.getClustersForResourceGroup(resourceGroupId, clusters);
        } else {
          clustersInGroup = this.HybridServicesClusterService.getUnassignedClusters(clusters);
        }

        // No clusters in group: obviously not going to work
        if (clustersInGroup.length === 0) {
          return false;
        }

        return _.some(clustersInGroup, (cluster) => {
          return _.some(cluster.connectors, connector => connector.connectorType === connectorType);
        });
      });
  }

  private extractDataFromResponse<T>(response: ng.IHttpResponse<T>) {
    return _.get<T>(response, 'data');
  }

  private extractGroupsFromResponse<T>(response: ng.IHttpResponse<T>) {
    const data = this.extractDataFromResponse(response);
    return _.get<T[]>(data, 'items', []);
  }
}

export default angular
  .module('hercules.resource-group-service', [])
  .service('ResourceGroupService', ResourceGroupService)
  .name;
