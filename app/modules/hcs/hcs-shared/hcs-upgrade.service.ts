import { ISftpServer } from 'modules/hcs/hcs-setup/hcs-setup-sftp';
import { IHcsCluster, IHcsCustomerClusters, IHcsClusterSummaryItem, ISftpServerItem, IHcsUpgradeCustomer } from './hcs-upgrade';
import { ISoftwareProfile, IApplicationVersion, ISoftwareProfilesObject } from './hcs-swprofile';

interface ISftpServerResource extends ng.resource.IResourceClass<ng.resource.IResource<ISftpServer>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<ISftpServer>>;
}

interface IClusterResource extends ng.resource.IResourceClass<ng.resource.IResource<IHcsCluster>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<IHcsCluster>>;
}

interface INodeResource extends ng.resource.IResourceClass<ng.resource.IResource<ISftpServerItem>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<ISftpServerItem>>;
}

interface ICustomerClustersResource extends ng.resource.IResourceClass<ng.resource.IResource<IHcsCustomerClusters>> {}

type ICustomerType = IHcsUpgradeCustomer & ng.resource.IResource<IHcsUpgradeCustomer>;
interface ICustomerResource extends ng.resource.IResourceClass<ICustomerType> {}

interface ISwProfileResource extends ng.resource.IResourceClass<ng.resource.IResource<ISoftwareProfile>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<ISoftwareProfile>>;
}

type ISwProfileType = ISoftwareProfilesObject & ng.resource.IResource<ISoftwareProfilesObject>;
interface ISwProfilesResource extends ng.resource.IResourceClass<ISwProfileType> {}

interface IApplicationVersionResource extends ng.resource.IResourceClass<ng.resource.IResource<IApplicationVersion>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<IApplicationVersion>>;
}

export class HcsUpgradeService {
  private sftpServerResource: ISftpServerResource;
  private clusterResource: IClusterResource;
  private customerClustersResource: ICustomerClustersResource;
  private swProfileResource: ISwProfileResource;
  private swProfilesResource: ISwProfilesResource;
  private appVersionResource: IApplicationVersionResource;
  private nodeResource: INodeResource;
  private customerResource: ICustomerResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private UrlConfig,
  ) {
    const BASE_URL = this.UrlConfig.getHcsUpgradeServiceUrl();

    const updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };
    const queryAction: ng.resource.IActionDescriptor = {
      method: 'GET',
      isArray: true,
    };

    this.sftpServerResource = <ISftpServerResource>this.$resource(BASE_URL + 'partners/:partnerId/sftpServers/:sftpServerId', {},
      {
        update: updateAction,
      });
    this.clusterResource = <IClusterResource>this.$resource(BASE_URL + 'partners/:partnerId/clusters/:clusterId', {},
      {
        update: updateAction,
        query: queryAction,
      });

    this.customerClustersResource = <ICustomerClustersResource>this.$resource(BASE_URL + 'partners/:partnerId/clusters?customer=:customerId', {}, {});

    this.swProfileResource = <ISwProfileResource>this.$resource(BASE_URL + 'partners/:partnerId/softwareprofiles/:id', {},
      {
        update: updateAction,
        query: queryAction,
      });

    this.appVersionResource = <IApplicationVersionResource>this.$resource(BASE_URL + 'applicationVersions', {}, {});

    this.nodeResource = <INodeResource>this.$resource(BASE_URL + 'partners/:partnerId/upgradeNodeInfos/:nodeId', {}, {});
    this.customerResource = this.$resource<ICustomerType>(BASE_URL + 'partners/:partnerId/customers', {}, {});
  }

  public createSftpServer(sftpServer: ISftpServer): ng.IPromise<any> {
    return this.sftpServerResource.save({
      partnerId: this.Authinfo.getOrgId(),
    }, sftpServer).$promise;
  }

  public getSftpServer(_sftpServerId: string): ng.IPromise<ISftpServer> {
    return this.sftpServerResource.get({
      partnerId: this.Authinfo.getOrgId(),
      sftpServerId: _sftpServerId,
    }).$promise;
  }

  public updateSftpServer(_sftpServerId: string, sftpServer: ISftpServer): ng.IPromise<any>  {
    return this.sftpServerResource.update({
      partnerId: this.Authinfo.getOrgId(),
      sftpServerId: _sftpServerId,
    }, sftpServer).$promise;
  }

  public deleteSftpServer(_sftpServerId: string): ng.IPromise<any> {
    return this.sftpServerResource.delete({
      partnerId: this.Authinfo.getOrgId(),
      sftpServerId: _sftpServerId,
    }).$promise;
  }

  public listSftpServers(): ng.IPromise <any> {
    return this.sftpServerResource.get({
      partnerId: this.Authinfo.getOrgId(),
    }).$promise.then(response => {
      return response;
    });
  }

  public getCluster(_clusterId: string): ng.IPromise<IHcsCluster> {
    return this.clusterResource.get({
      partnerId: this.Authinfo.getOrgId(),
      clusterId: _clusterId,
    }).$promise.then(response => {
      return response;
    });
  }

  public updateCluster(_clusterId: string, cluster: IHcsCluster) {
    return this.clusterResource.update({
      partnerId: this.Authinfo.getOrgId(),
      clusterId: _clusterId,
    }, cluster).$promise;
  }

  public listAllClusters(): ng.IPromise <IHcsClusterSummaryItem[]> {
    return this.customerClustersResource.get({
      partnerId: this.Authinfo.getOrgId(),
    }).$promise.then(response => {
      return response.clusters;
    });
  }

  public listClusters(customerId?: string): ng.IPromise <IHcsClusterSummaryItem[]> {
    return this.customerClustersResource.get({
      partnerId: this.Authinfo.getOrgId(),
      customerId: customerId,
    }).$promise.then(response => {
      return response.clusters;
    });
  }

  public createSoftwareProfile(swProfile: ISoftwareProfile): ng.IPromise<any> {
    return this.swProfileResource.save({
      partnerId: this.Authinfo.getOrgId(),
    }, swProfile).$promise;
  }

  public getSoftwareProfile(_id: string): ng.IPromise<ISoftwareProfile> {
    return this.swProfileResource.get({
      partnerId: this.Authinfo.getOrgId(),
      id: _id,
    }).$promise;
  }

  public getSoftwareProfiles(): ng.IPromise<ISoftwareProfile[]> {
    return this.swProfilesResource.get({
      partnerId: this.Authinfo.getOrgId(),
    }).$promise.then(response => {
      return response.softwareProfiles;
    });
  }

  public updateSoftwareProfile(swProfile: ISoftwareProfile): ng.IPromise<any>  {
    return this.swProfileResource.update({
      partnerId: this.Authinfo.getOrgId(),
      id: swProfile.uuid,
    }, swProfile).$promise;
  }

  public deleteSoftwareProfile(_id: string): ng.IPromise<any> {
    return this.swProfileResource.delete({
      partnerId: this.Authinfo.getOrgId(),
      id: _id,
    }).$promise;
  }

  public listSoftwareProfiles(): ng.IPromise <any> {
    return this.swProfileResource.get({
      partnerId: this.Authinfo.getOrgId(),
    }).$promise;
  }

  public listAppVersions(): ng.IPromise<IApplicationVersion> {
    return this.appVersionResource.get().$promise;
  }

  public getAppVersions(apptype: string): ng.IPromise<IApplicationVersion> {
    return this.appVersionResource.get({
      type: apptype,
    }).$promise;
  }

  public updateNodeSftp(nodeId: string, sftp: ISftpServerItem): ng.IPromise<any> {
    return this.nodeResource.update({
      partnerId: this.Authinfo.getOrgId(),
      nodeId: nodeId,
    }, sftp).$promise;
  }

  public addHcsUpgradeCustomer(customer: IHcsUpgradeCustomer): ng.IPromise<any> {
    return this.customerResource.save({
      partnerId: this.Authinfo.getOrgId(),
    }, customer).$promise;
  }
}
