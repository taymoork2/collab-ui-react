import { IPrivateTrunkResource, IPrivateTrunkDomain, IPrivateTrunkInfo } from './private-trunk';

interface IDestinationResource extends ng.resource.IResourceClass<ng.resource.IResource<IPrivateTrunkResource>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

interface IPrivateTrunk extends ng.resource.IResourceClass<ng.resource.IResource<IPrivateTrunkDomain>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

export class PrivateTrunkService {
  private privateTrunkResourceService: IDestinationResource;
  private privateTrunkService: IPrivateTrunk;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {
    let updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };

    this.privateTrunkResourceService = <IDestinationResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/privatetrunks/resources/:resourceId', {},
      {
        update: updateAction,
      });

    this.privateTrunkService = <IPrivateTrunk>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/privatetrunks/', {},
      {
        update: updateAction,
      });
  }

  public getPrivateTrunk(): ng.IPromise<IPrivateTrunkInfo> {
    return this.privateTrunkService.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise
    .then((resp) => {
      return _.pick(resp, 'resources', 'domains');
    });
  }

  public setPrivateTrunk(domains: Array<string>): ng.IPromise<void> {
    return this.privateTrunkService.update({
      customerId: this.Authinfo.getOrgId(),
    }, {
      domains: domains,
    }).$promise;
  }

  public deprovisionPrivateTrunk(): ng.IPromise<any> {
    return this.privateTrunkService.remove({
      customerId: this.Authinfo.getOrgId(),
    }).$promise;
  }

  public createPrivateTrunkResource(privateTrunkResource: IPrivateTrunkResource): ng.IPromise<IPrivateTrunkResource> {
    return this.privateTrunkResourceService.save({
      customerId: this.Authinfo.getOrgId(),
    }, {
      name: privateTrunkResource.name,
      address: privateTrunkResource.address,
      port: privateTrunkResource.port,
    }).$promise;
  }

  public listPrivateTrunkResources(): ng.IPromise<Array<IPrivateTrunkResource>> {
    return this.privateTrunkResourceService.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise
    .then(res => {
      return _.pick(res, 'resources');
    });
  }

  public setPrivateTrunkResource(resourceId: string, name: string): ng.IPromise<void> {
    return this.privateTrunkResourceService.update({
      customerId: this.Authinfo.getOrgId(),
      resourceId: resourceId,
    }, {
      name: name,
    }).$promise;
  }

  public removePrivateTrunkResource(resourceId: string): ng.IPromise<any> {
    return this.privateTrunkResourceService.remove({
      customerId: this.Authinfo.getOrgId(),
      resourceId: resourceId,
    }).$promise;
  }

}
