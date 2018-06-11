import { IHcsInstallables, IControllerNode, IHcsCustomer, IHcsPartner } from './hcs-controller';
import { Config } from 'modules/core/config/config';
import { IHcsNode } from './hcs-upgrade';

type IHcsNodeListType = IControllerNode[] & ng.resource.IResourceArray<IControllerNode>;
interface IInstallablesResource extends ng.resource.IResourceClass<ng.resource.IResource<IHcsInstallables>> {}
interface INodeListResource extends ng.resource.IResourceClass<IHcsNodeListType> {}

type IHcsCustomerType = IHcsCustomer & ng.resource.IResource<IHcsCustomer>;
interface IHcsCustomerResource extends ng.resource.IResourceClass<IHcsCustomerType> {}

interface IHcsAgentResource extends ng.resource.IResourceClass<ng.resource.IResource<any>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<any>>;
}
interface IHcsPartnerResource extends ng.resource.IResourceClass<ng.resource.IResource<IHcsPartner>> { }

export class HcsControllerService {
  private installablesResource: IInstallablesResource;
  private nodeListResource: INodeListResource;

  private customerResource: IHcsCustomerResource;
  private agentResource: IHcsAgentResource;
  private agentVerifyResource: IHcsAgentResource;
  private partnerResource: IHcsPartnerResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private UrlConfig,
    private Config: Config,
    private Userservice,
  ) {
    const BASE_URL = this.UrlConfig.getHcsControllerServiceUrl();


    const updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };

    const postAction: ng.resource.IActionDescriptor = {
      method: 'POST',
      isArray: true,
    };
    const queryAction: ng.resource.IActionDescriptor = {
      method: 'GET',
      isArray: true,
    };

    this.installablesResource = <IInstallablesResource>this.$resource(BASE_URL + 'partners/:partnerId/installables/:id', {},
      {
        query: queryAction,
      });

    this.nodeListResource = this.$resource<IHcsNodeListType>(BASE_URL + 'inventory/organizations/:partnerId/lists/nodes', {},
      {
        save: postAction,
      });

    this.customerResource = this.$resource<IHcsCustomerType>(BASE_URL + 'partners/:partnerId/customers/:customerId', {},
      {
        query: queryAction,
      });

    this.agentVerifyResource = <IHcsAgentResource>this.$resource(BASE_URL + 'inventory/organizations/:partnerId/agents/:agentId/verify', {},
      {
        update: updateAction,
      });

    this.agentResource = <IHcsAgentResource>this.$resource(BASE_URL + 'inventory/organizations/:partnerId/agents/:agentId', {}, {});

    this.partnerResource = <IHcsPartnerResource>this.$resource(BASE_URL + 'partners/:partnerId', {},
      {
        query: queryAction,
      });

  }

  public createAgentInstallFile(installable: IHcsInstallables): ng.IPromise<any> {
    return this.installablesResource.save({
      partnerId: this.Authinfo.getOrgId(),
    }, installable).$promise;
  }

  public getAgentInstallFile(_id: string): ng.IPromise<IHcsInstallables> {
    return this.installablesResource.get({
      partnerId: this.Authinfo.getOrgId(),
      id: _id,
    }).$promise;
  }

  public deleteAgentInstallFile(_id: string): ng.IPromise<any> {
    return this.installablesResource.delete({
      partnerId: this.Authinfo.getOrgId(),
      id: _id,
    }).$promise;
  }

  public listAgentInstallFile(): ng.IPromise<any[]> {
    return this.installablesResource.query({
      partnerId: this.Authinfo.getOrgId(),
    }).$promise.then(resp => {
      return resp;
    });
  }

  //It is a post action that returns data hence the name getNodesStatus
  public getNodesStatus(nodeIds: string[]): ng.IPromise<IControllerNode[]> {
    return this.nodeListResource.save({
      partnerId: this.Authinfo.getOrgId(),
    }, {
      nodeIds: nodeIds,
    }).$promise.then(response => {
      return response;
    });
  }

  public getHcsCustomers(): ng.IPromise<IHcsCustomer[]> {
    return this.customerResource.query({
      partnerId: this.Authinfo.getOrgId(),
    }).$promise.then(response => {
      return response;
    });
  }


  public addHcsControllerCustomer(customerName: string, services: string[]): ng.IPromise<IHcsCustomer> {
    return this.customerResource.save({
      partnerId: this.Authinfo.getOrgId(),
    }, {
      name: customerName,
      services: services,
    }).$promise;
  }

  public getHcsControllerCustomer(customerId: string| undefined): ng.IPromise<IHcsCustomer> {
    return this.customerResource.get({
      partnerId: this.Authinfo.getOrgId(),
      customerId: customerId,
    }).$promise;
  }

  public rejectAgent(node: IHcsNode): ng.IPromise<any> {
    return this.agentResource.delete({
      partnerId: this.Authinfo.getOrgId(),
      agentId: node.agentUuid,
    }, {}).$promise;
  }

  public acceptAgent(node: IHcsNode): ng.IPromise<any> {
    return this.agentVerifyResource.update({
      partnerId: this.Authinfo.getOrgId(),
      agentId: node.agentUuid,
    }, {}).$promise;
  }
  public createHcsPartner(_services: string[]): ng.IPromise<IHcsPartner> {
    return this.partnerResource.save({
    }, {
      orgId: this.Authinfo.getOrgId(),
      name: this.Authinfo.getOrgName(),
      services: _services,
    }).$promise;
  }

  public updateUserEntitlement(userId: string, entitlements: string[]) {
    const userData = {
      schemas: this.Config.scimSchemas,
      entitlements: entitlements,
    };
    return this.Userservice.updateUserData(userId, userData);
  }
}
