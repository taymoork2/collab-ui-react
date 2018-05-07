import { ISftpServer } from 'modules/hcs/hcs-setup/hcs-setup-sftp';
import { IHcsCluster, IHcsCustomerClusters, IHcsClusterSummaryItem } from './hcs-upgrade';
import { ISoftwareProfile, IApplicationVersion } from './hcs-swprofile';

interface ISftpServerResource extends ng.resource.IResourceClass<ng.resource.IResource<ISftpServer>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<ISftpServer>>;
}

interface IClusterResource extends ng.resource.IResourceClass<ng.resource.IResource<IHcsCluster>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<IHcsCluster>>;
}

interface ICustomerClustersResource extends ng.resource.IResourceClass<ng.resource.IResource<IHcsCustomerClusters>> {}

interface ISwProfileResource extends ng.resource.IResourceClass<ng.resource.IResource<ISoftwareProfile>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<ISoftwareProfile>>;
}

interface IApplicationVersionResource extends ng.resource.IResourceClass<ng.resource.IResource<IApplicationVersion>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<IApplicationVersion>>;
}

export class HcsUpgradeService {
  private sftpServerResource: ISftpServerResource;
  private clusterResource: IClusterResource;
  private customerClustersResource: ICustomerClustersResource;
  private swProfileResource: ISwProfileResource;
  private appVersionResource: IApplicationVersionResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private UrlConfig,
  ) {
    const BASIC_AUTH_VAL = 'Basic aGNzdXNfdXNlcjo0NGJlNjJiMWNhNzVhMWJjMWI1YzAwNWE5OTJhNTU1NzZhZWEwMjFi'; //To-do Temporary usage from Upgrade Service
    const BASE_URL = this.UrlConfig.getHcsUpgradeServiceUrl();

    const updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
      headers: {
        Authorization: BASIC_AUTH_VAL,
      },
    };
    const saveAction: ng.resource.IActionDescriptor = {
      method: 'POST',
      headers: {
        Authorization: BASIC_AUTH_VAL,
      },
    };
    const queryAction: ng.resource.IActionDescriptor = {
      method: 'GET',
      isArray: true,
      headers: {
        Authorization: BASIC_AUTH_VAL,
      },
    };
    const getAction: ng.resource.IActionDescriptor = {
      method: 'GET',
      headers: {
        Authorization: BASIC_AUTH_VAL,
      },
    };
    const deleteAction: ng.resource.IActionDescriptor = {
      method: 'DELETE',
      headers: {
        Authorization: BASIC_AUTH_VAL,
      },
    };

    this.sftpServerResource = <ISftpServerResource>this.$resource(BASE_URL + 'partners/:partnerId/sftpServers/:sftpServerId', {},
      {
        update: updateAction,
        save: saveAction,
        query: queryAction,
        delete: deleteAction,
      });
    this.clusterResource = <IClusterResource>this.$resource(BASE_URL + 'partners/:partnerId/clusters/:clusterId', {},
      {
        update: updateAction,
        save: saveAction,
        query: queryAction,
      });

    this.customerClustersResource = <ICustomerClustersResource>this.$resource(BASE_URL + 'partners/:partnerId/clusters?customer=:customerId', {},
      {
        update: updateAction,
        save: saveAction,
        get: getAction,
      });

    this.swProfileResource = <ISwProfileResource>this.$resource(BASE_URL + 'partners/:partnerId/softwareprofile/:id', {},
      {
        update: updateAction,
        save: saveAction,
        get: getAction,
      });

    this.appVersionResource = <IApplicationVersionResource>this.$resource(BASE_URL + 'applicationVersions', {},
      {
        get: getAction,
      });
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
    }).$promise;
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

  public createSwProfile(swProfile: ISoftwareProfile): ng.IPromise<any> {
    return this.swProfileResource.save({
      partnerId: this.Authinfo.getOrgId(),
    }, swProfile).$promise;
  }

  public getSwProfile(_id: string): ng.IPromise<ISoftwareProfile> {
    return this.swProfileResource.get({
      partnerId: this.Authinfo.getOrgId(),
      id: _id,
    }).$promise;
  }

  public updateSwProfile(_id: string, swProfile: ISoftwareProfile): ng.IPromise<any>  {
    return this.swProfileResource.update({
      partnerId: this.Authinfo.getOrgId(),
      id: _id,
    }, swProfile).$promise;
  }

  public deleteSwProfile(_id: string): ng.IPromise<any> {
    return this.swProfileResource.delete({
      partnerId: this.Authinfo.getOrgId(),
      id: _id,
    }).$promise;
  }

  public listSwProfiles(): ng.IPromise <any[]> {
    return this.swProfileResource.query({
      partnerId: this.Authinfo.getOrgId(),
    }).$promise;
  }

  public listAppVersions(): ng.IPromise <IApplicationVersion> {
    return this.appVersionResource.get().$promise;
  }
}
