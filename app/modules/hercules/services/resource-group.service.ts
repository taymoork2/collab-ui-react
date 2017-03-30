import { ConnectorType, ICluster, IResourceGroup, IReleaseChannelsResponse } from 'modules/hercules/hybrid-services.types';

interface IOption {
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
    private FusionClusterService,
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
      .get(`${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/resourceGroups`)
      .then(this.extractGroupsFromResponse);
  }

  public create(name: string, releaseChannel: string, orgId?: string): ng.IPromise<EmptyHTTPResponse> {
    return this.$http
      .post(`${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/resourceGroups`, {
        name,
        releaseChannel,
      })
      .then(this.extractDataFromResponse);
  }

  public remove(resourceGroupId: string, orgId?: string): ng.IPromise<EmptyHTTPResponse> {
    return this.$http.delete(`${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/resourceGroups/${resourceGroupId}`)
      .then(this.extractDataFromResponse);
  }

  public setName(resourceGroupId: string, name: string, orgId?: string): ng.IPromise<EmptyHTTPResponse> {
    return this.$http
      .patch(`${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/resourceGroups/${resourceGroupId}`, {
        name: name,
      })
      .then(this.extractDataFromResponse);
  }

  public setReleaseChannel(resourceGroupId: string, releaseChannel: string, orgId?: string): ng.IPromise<EmptyHTTPResponse> {
    return this.$http
      .patch(`${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/resourceGroups/${resourceGroupId}`, {
        releaseChannel,
      })
      .then(this.extractDataFromResponse);
  }

  public getAllowedChannels(orgId?: string): ng.IPromise<string[]> {
    return this.$http
      .get<IReleaseChannelsResponse>(`${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/channels`)
      .then(this.extractDataFromResponse)
      .then((data: IReleaseChannelsResponse) => {
        let allowedChannels: string[] = [];
        _.forEach(data.releaseChannels, channel => {
          if (channel.entitled) {
            allowedChannels.push(channel.channel);
          }
        });
        return allowedChannels;
      });
  }

  public assign(clusterId, resourceGroupId, orgId?): ng.IPromise<EmptyHTTPResponse> {
    return this.$http.patch(`${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/clusters/${clusterId}`, {
      resourceGroupId,
    })
      .then(this.extractDataFromResponse);
  }

  public getAllAsOptions(orgId): ng.IPromise<IOption[]> {
    return this.getAll(orgId)
      .then(groups => {
        const options: IOption[] = _.map(groups, (group) => {
          return {
            label: group.name + (group.releaseChannel ? ' (' + this.$translate.instant('hercules.fusion.add-resource-group.release-channel.' + group.releaseChannel) + ')' : ''),
            value: group.id,
          };
        });
        return options;
      });
  }

  public resourceGroupHasEligibleCluster(resourceGroupId: string, connectorType: ConnectorType): ng.IPromise<boolean> {
    return this.FusionClusterService.getAll()
      .then(clusters => {
        let clustersInGroup: ICluster[];
        if (resourceGroupId !== '') {
          clustersInGroup = this.FusionClusterService.getClustersForResourceGroup(resourceGroupId, clusters);
        } else {
          clustersInGroup = this.FusionClusterService.getUnassignedClusters(clusters);
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

  private extractDataFromResponse<T>(response: ng.IHttpPromiseCallbackArg<T>) {
    return _.get<T>(response, 'data');
  }

  private extractGroupsFromResponse<T>(response: ng.IHttpPromiseCallbackArg<T>) {
    const data = this.extractDataFromResponse(response);
    return _.get<T[]>(data, 'items', []);
  }
}

export default angular
  .module('Hercules')
  .service('ResourceGroupService', ResourceGroupService)
  .name;
