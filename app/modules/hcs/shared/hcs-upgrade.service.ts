import { ISftpServer } from '../setup/hcs-setup-sftp';
import { IHcsCluster } from './hcs-upgrade';

interface ISftpServerResource extends ng.resource.IResourceClass<ng.resource.IResource<ISftpServer>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<ISftpServer>>;
}

interface IClusterResource extends ng.resource.IResourceClass<ng.resource.IResource<IHcsCluster>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<IHcsCluster>>;
}

export class HcsUpgradeService {
  private sftpServerResource: ISftpServerResource;
  private clusterResource: IClusterResource;
  private clusterCustomerResource: IClusterResource;
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
    this.clusterResource = <IClusterResource>this.$resource(BASE_URL + 'partners/:partnerId/clusters/:clusterid', {},
      {
        update: updateAction,
        save: saveAction,
        query: queryAction,
      });

    this.clusterCustomerResource = <IClusterResource>this.$resource(BASE_URL + 'partners/:partnerId/clusters?customer=:customerId', {},
      {
        update: updateAction,
        save: saveAction,
        query: queryAction,
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

  public listSftpServers(): ng.IPromise <any[]> {
    return this.sftpServerResource.query({
      partnerId: this.Authinfo.getOrgId(),
    }).$promise;
  }

  public getCluster(_clusterId: string): ng.IPromise<IHcsCluster> {
    return this.clusterResource.get({
      partnerId: this.Authinfo.getOrgId(),
      clusterId: _clusterId,
    }).$promise;
  }

  public updateCluster(_clusterId: string, cluster: IHcsCluster) {
    return this.clusterResource.update({
      partnerId: this.Authinfo.getOrgId(),
      clusterId: _clusterId,
    }, cluster).$promise;
  }

  public listAllClusters(): ng.IPromise <any[]> {
    return this.clusterResource.query({
      partnerId: this.Authinfo.getOrgId(),
    }).$promise;
  }

  public listClusters(customerId?: string): ng.IPromise <any[]> {
    return this.clusterCustomerResource.query({
      partnerId: this.Authinfo.getOrgId(),
      customerId: customerId,
    }).$promise;
  }
}
