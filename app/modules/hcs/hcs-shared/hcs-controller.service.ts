import { IHcsInstallables } from './hcs-controller';
interface IInstallablesResource extends ng.resource.IResourceClass<ng.resource.IResource<IHcsInstallables>> {}

export class HcsControllerService {
  private installablesResource: IInstallablesResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private UrlConfig,
  ) {
    const BASIC_AUTH_VAL = 'Basic aGNzdXNfdXNlcjo0NGJlNjJiMWNhNzVhMWJjMWI1YzAwNWE5OTJhNTU1NzZhZWEwMjFi'; //To-do Temporary usage from Upgrade Service
    const BASE_URL = this.UrlConfig.getHcsControllerServiceUrl();

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

    this.installablesResource = <IInstallablesResource>this.$resource(BASE_URL + 'partners/:partnerId/installables/:id', {},
      {
        save: saveAction,
        query: queryAction,
        delete: deleteAction,
        get: getAction,
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
}
