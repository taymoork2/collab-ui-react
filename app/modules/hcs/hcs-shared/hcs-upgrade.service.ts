import { ISftpServer } from 'modules/hcs/hcs-setup/hcs-setup-sftp';
import { IHcsCluster, IHcsCustomerClusters, IHcsClusterSummaryItem, ISftpServerItem, IHcsUpgradeCustomer, IHcsClusterTask, ISftpServersObject } from './hcs-upgrade';
import { ISoftwareProfile, IApplicationVersion, ISoftwareProfilesObject } from './hcs-swprofile';

type ISftpServerType = ISftpServer & ng.resource.IResource<ISftpServer>;
interface ISftpServerResource extends ng.resource.IResourceClass<ISftpServerType> {
  update: ng.resource.IResourceMethod<ISftpServerType>;
}

type ISftpServersObjectType = ISftpServersObject & ng.resource.IResource<ISftpServersObject>;
interface ISftpServersResource extends ng.resource.IResourceClass<ISftpServersObjectType> {
  update: ng.resource.IResourceMethod<ISftpServersObjectType>;
}

interface IClusterResource extends ng.resource.IResourceClass<ng.resource.IResource<IHcsCluster>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<IHcsCluster>>;
}

interface INodeResource extends ng.resource.IResourceClass<ng.resource.IResource<ISftpServerItem>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<ISftpServerItem>>;
}

interface ICustomerClustersResource extends ng.resource.IResourceClass<ng.resource.IResource<IHcsCustomerClusters>> {}

type ICustomerType = IHcsUpgradeCustomer & ng.resource.IResource<IHcsUpgradeCustomer>;
interface ICustomerResource extends ng.resource.IResourceClass<ICustomerType> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<ICustomerType>>;
}

interface ISwProfileResource extends ng.resource.IResourceClass<ng.resource.IResource<ISoftwareProfile>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<ISoftwareProfile>>;
}

type ISwProfilesObjectType = ISoftwareProfilesObject & ng.resource.IResource<ISoftwareProfilesObject>;
interface ISwProfilesResource extends ng.resource.IResourceClass<ISwProfilesObjectType> {
  update: ng.resource.IResourceMethod<ISwProfilesObjectType>;
}

interface IApplicationVersionResource extends ng.resource.IResourceClass<ng.resource.IResource<IApplicationVersion>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<IApplicationVersion>>;
}

type IClusterTaskType = IHcsClusterTask & ng.resource.IResource<IHcsClusterTask>;
interface IClusterTaskResource extends ng.resource.IResourceClass<IClusterTaskType> {}

export class HcsUpgradeService {
  private sftpServerResource: ISftpServerResource;
  private sftpServersResource: ISftpServersResource;
  private clusterResource: IClusterResource;
  private customerClustersResource: ICustomerClustersResource;
  private swProfileResource: ISwProfileResource;
  private swProfilesResource: ISwProfilesResource;
  private appVersionResource: IApplicationVersionResource;
  private nodeResource: INodeResource;
  private customerResource: ICustomerResource;
  private clusterUpgradeResource;
  private clusterTaskStatusResource: IClusterTaskResource;
  private tasksResource;
  private statusCheckResource;

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
        query: queryAction,
      });
    this.sftpServersResource = <ISftpServersResource>this.$resource(BASE_URL + 'partners/:partnerId/sftpServers', {});
    this.clusterResource = <IClusterResource>this.$resource(BASE_URL + 'partners/:partnerId/clusters/:clusterId', {},
      {
        update: updateAction,
        query: queryAction,
      });

    this.customerClustersResource = <ICustomerClustersResource>this.$resource(BASE_URL + 'partners/:partnerId/clusters', {}, {});

    this.swProfileResource = <ISwProfileResource>this.$resource(BASE_URL + 'partners/:partnerId/softwareprofiles/:id', {},
      {
        update: updateAction,
        query: queryAction,
      });
    this.swProfilesResource = <ISwProfilesResource>this.$resource(BASE_URL + 'partners/:partnerId/softwareprofiles/:id', {});

    this.appVersionResource = <IApplicationVersionResource>this.$resource(BASE_URL + 'applicationVersions', {}, {});

    this.nodeResource = <INodeResource>this.$resource(BASE_URL + 'partners/:partnerId/upgradeNodeInfos/:nodeId', {}, {
      update: updateAction,
    });
    this.customerResource = <ICustomerResource>this.$resource(BASE_URL + 'partners/:partnerId/customers/:customerId', {}, {
      update: updateAction,
      query: queryAction,
    });
    this.clusterUpgradeResource = this.$resource(BASE_URL + 'partners/:partnerId/clusters/:clusterId/upgradeorder', {}, {});

    this.clusterTaskStatusResource = this.$resource<IClusterTaskType>(BASE_URL + 'partners/:partnerId/clusters/:clusterId/tasks/latest', {}, {});
    this.tasksResource = this.$resource(BASE_URL + 'partners/:partnerId/clusters/:clusterId/tasks/:taskId', {}, {});
    this.statusCheckResource = this.$resource(BASE_URL + 'partners/:partnerId/clusters/:clusterId/statusCheck', {}, {});
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

  public listSftpServers(): ng.IPromise <ISftpServersObject> {
    return this.sftpServersResource.get({
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

  public deleteCluster(_clusterId: string): ng.IPromise<IHcsCluster> {
    return this.clusterResource.delete({
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
      customer: customerId,
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

  public listSoftwareProfiles(): ng.IPromise <ISoftwareProfilesObject> {
    return this.swProfilesResource.get({
      partnerId: this.Authinfo.getOrgId(),
    }).$promise;
  }

  public listAppVersions(): ng.IPromise<IApplicationVersion> {
    return this.appVersionResource.get().$promise;
  }

  public getAppVersions(apptype: string): ng.IPromise<IApplicationVersion> {
    return this.appVersionResource.get({
      application: apptype,
    }).$promise;
  }

  public getUpgradeOrder(clusterId: string): ng.IPromise<any> {
    return this.clusterUpgradeResource.get({
      partnerId: this.Authinfo.getOrgId(),
      clusterId: clusterId,
    }).$promise;
  }

  public saveUpgradeOrder(clusterId: string, nodeOrder): ng.IPromise<any> {
    return this.clusterUpgradeResource.save({
      partnerId: this.Authinfo.getOrgId(),
      clusterId: clusterId,
    }, nodeOrder).$promise;
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

  public getHcsUpgradeCustomer(customerId: string | undefined): ng.IPromise<IHcsUpgradeCustomer> {
    return this.customerResource.get({
      partnerId: this.Authinfo.getOrgId(),
      customerId: customerId,
    }).$promise;
  }

  public updateHcsUpgradeCustomerSwProfile(customerId: string | undefined, swProfile: ISoftwareProfile): ng.IPromise<IHcsUpgradeCustomer> {
    return this.customerResource.update({
      partnerId: this.Authinfo.getOrgId(),
      customerId: customerId,
    }, { softwareProfile: swProfile }).$promise;
  }

  public listHcsUpgradeCustomers(): ng.IPromise<IHcsUpgradeCustomer[]> {
    return this.customerResource.query({
      partnerId: this.Authinfo.getOrgId(),
    }).$promise;
  }

  public listAssignedHcsUpgradeCustomers(): ng.IPromise<IHcsUpgradeCustomer[]> {
    return this.customerResource.query({
      partnerId: this.Authinfo.getOrgId(),
      clusterAssigned: true,
    }).$promise;
  }

  public getClusterTasksStatus(clusterId: string): ng.IPromise<any> {
    return this.clusterTaskStatusResource.get({
      partnerId: this.Authinfo.getOrgId(),
      clusterId: clusterId,
    }).$promise;
  }

  public startTasks(clusterUuid: string, taskType: string, prechecks?: string[]) {
    const taskObj = {
      taskType: taskType,
    };

    if (prechecks) {
      taskObj['actions'] = prechecks;
    }

    return this.tasksResource.save({
      partnerId: this.Authinfo.getOrgId(),
      clusterId: clusterUuid,
    }, taskObj).$promise;
  }

  public getTask(clusterUuid, taskId) {
    return this.tasksResource.get({
      partnerId: this.Authinfo.getOrgId(),
      clusterId: clusterUuid,
      taskId: taskId,
    }).$promise;
  }

  public getPrecheckStatus(clusterUuid: string) {
    return this.statusCheckResource.get({
      partnerId: this.Authinfo.getOrgId(),
      clusterId: clusterUuid,
    }, {}).$promise;
  }
}
