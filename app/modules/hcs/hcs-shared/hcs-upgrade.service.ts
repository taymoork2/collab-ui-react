import { ISftpServer } from 'modules/hcs/hcs-setup/hcs-setup-sftp';
import { IHcsCluster, IHcsCustomerClusters, IHcsClusterSummaryItem, ISftpServerItem, IHcsUpgradeCustomer } from './hcs-upgrade';
import { ISoftwareProfile, IApplicationVersion } from './hcs-swprofile';

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
interface ICustomerResource extends ng.resource.IResourceClass<ICustomerType> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<ICustomerType>>;
}


interface ISwProfileResource extends ng.resource.IResourceClass<ng.resource.IResource<ISoftwareProfile>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<ISoftwareProfile>>;
}

interface IApplicationVersionResource extends ng.resource.IResourceClass<ng.resource.IResource<IApplicationVersion>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<IApplicationVersion>>;
}

//type IClusterTaskType = IHcsClusterTask & ng.resource.IResource<IHcsClusterTask>;
//interface IClusterTaskResource extends ng.resource.IResourceClass<IClusterTaskType> {}

export class HcsUpgradeService {
  private sftpServerResource: ISftpServerResource;
  private clusterResource: IClusterResource;
  private customerClustersResource: ICustomerClustersResource;
  private swProfileResource: ISwProfileResource;
  private appVersionResource: IApplicationVersionResource;
  private nodeResource: INodeResource;
  private customerResource: ICustomerResource;
  private clusterUpgradeResource;
  //private clusterTaskStatusResource: IClusterTaskResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private $q: ng.IQService,
    private $timeout: ng.ITimeoutService,
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

    this.nodeResource = <INodeResource>this.$resource(BASE_URL + 'partners/:partnerId/upgradeNodeInfos/:nodeId', {}, {
      update: updateAction,
    });
    this.customerResource = <ICustomerResource>this.$resource(BASE_URL + 'partners/:partnerId/customers/:customerId', {}, {
      update: updateAction,
      query: queryAction,
    });
    this.clusterUpgradeResource = this.$resource(BASE_URL + 'partners/:partnerId/clusters/:clusterId/upgradeorder', {}, {});

    //this.clusterTaskStatusResource = this.$resource<IClusterTaskType>(BASE_URL + 'partners/:partnerId/clusters/:clusterId/tasks/latest', {}, {});
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

  public getClusterTasksStatus(clusterId: string): ng.IPromise<any> {
    // return this.clusterTaskStatusResource.get({
    //   partnerId: this.Authinfo.getOrgId(),
    //   clusterId: clusterId,
    // }).$promise;
    const clusterTaskStatusData = {
      status: 'UPGRADE_IN_PROGRESS',
      estimatedCompletion: '2018-05-04 04:19:45.895',
      nodeStatuses: [
        {
          uuid: 'd20538ef-3861-4f44-b633-e093e0a4aef1',
          sequence: 1,
          hostName: 'CCM-01',
          typeApplication: 'CUCM',
          publisher: true,
          previousDuration: '00:59:00.000',
          started: '2018-05-04 04:00:29.895',
          elapsedTime: '00:59:00.000',
          status: 'OPERATIONAL',
        },
        {
          uuid: 'd20538ef-3861-4f44-b633-e093e0a4aef2',
          sequence: 2,
          hostName: 'IMP-01',
          typeApplication: 'IM&P',
          publisher: true,
          previousDuration: '00:35:00.000',
          started: '2018-05-04 04:01:30.895',
          elapsedTime: '00:08:13.000',
          status: 'UPGRADE_IN_PROGRESS',
        },
      ],
    };

    this.$timeout(() => {
      if (clusterId) {
        deferred.resolve(clusterTaskStatusData);
      } else {
        deferred.reject('No cluster ID');
      }
    }, 200);

    const deferred = this.$q.defer();
    return deferred.promise;
  }
}
