import { IHcsInstallables, IControllerNode, IHcsCustomer } from './hcs-controller';
import { IHcsNode } from './hcs-upgrade';
type IHcsNodeListType = IControllerNode[] & ng.resource.IResourceArray<IControllerNode>;
interface IInstallablesResource extends ng.resource.IResourceClass<ng.resource.IResource<IHcsInstallables>> {}
interface INodeListResource extends ng.resource.IResourceClass<IHcsNodeListType> {}

type IHcsCustomerType = IHcsCustomer & ng.resource.IResource<IHcsCustomer>;
interface IHcsCustomersResource extends ng.resource.IResourceClass<IHcsCustomerType> {}

interface IHcsAgentResource extends ng.resource.IResourceClass<ng.resource.IResource<any>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<any>>;
}

export class HcsControllerService {
  private installablesResource: IInstallablesResource;
  private nodeListResource: INodeListResource;
  private customersResource: IHcsCustomersResource;
  private agentResource: IHcsAgentResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private UrlConfig,
  ) {
    const BASIC_AUTH_VAL = 'Basic aGNzdXNfdXNlcjo0NGJlNjJiMWNhNzVhMWJjMWI1YzAwNWE5OTJhNTU1NzZhZWEwMjFi'; //To-do Temporary usage from Upgrade Service
    const BASE_URL = this.UrlConfig.getHcsControllerServiceUrl();

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
    const postAction: ng.resource.IActionDescriptor = {
      method: 'POST',
      isArray: true,
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

    this.installablesResource = <IInstallablesResource>this.$resource(BASE_URL + 'partners/:partnerId/installables/:id', {},
      {
        save: saveAction,
        query: queryAction,
        delete: deleteAction,
        get: getAction,
      });

    this.nodeListResource = this.$resource<IHcsNodeListType>(BASE_URL + 'inventory/organizations/:partnerId/lists/nodes', {},
      {
        save: postAction,
      });

    this.customersResource = this.$resource<IHcsCustomerType>(BASE_URL + 'partners/:partnerId/customers', {},
      {
        query: queryAction,
        save: saveAction,
      });

    this.agentResource = <IHcsAgentResource>this.$resource(BASE_URL + 'inventory/organizations/:partnerId/agents/:agentId/verify', {},
      {
        update: updateAction,
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
    } ).$promise.then(response => {
      return response;
    });
  }

  public getHcsCustomers(): ng.IPromise<IHcsCustomer[]> {
    return this.customersResource.query({
      partnerId: this.Authinfo.getOrgId(),
    }).$promise.then(response => {
      return response;
    });
  }

  public addHcsControllerCustomer(customerName: string, services: string[]): ng.IPromise<IHcsCustomer> {
    return this.customersResource.save({
      partnerId: this.Authinfo.getOrgId(),
    }, {
      name: customerName,
      services: services,
    }).$promise;
  }

  public acceptAgent(node: IHcsNode): ng.IPromise<any> {
    return this.agentResource.update({
      partnerId: this.Authinfo.getOrgId(),
      agentId: node.agentUuid,
    }, {}).$promise;
  }
}
