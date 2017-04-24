
export interface IPrivateTrunkResource {
  name: string;
  address: string;
  port?: number | undefined | 0;
}

export interface IPrivateTrunkDomain {
  domains: Array<string>;
}

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

    this.privateTrunkResourceService = <IDestinationResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/privatetrunks/resources/', {},
      {
        update: updateAction,
      });

    this.privateTrunkService = <IPrivateTrunk>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/privatetrunks/', {},
      {
        update: updateAction,
      });
  }

  public setPrivateTrunk(domains: Array<string>): ng.IPromise<void> {
    return this.privateTrunkService.update({
      customerId: this.Authinfo.getOrgId(),
    }, {
      domains: domains,
    }).$promise;
  }

  public setPrivateTrunkResource(privateTrunkResource: IPrivateTrunkResource): ng.IPromise<IPrivateTrunkResource> {
    return this.privateTrunkResourceService.save({
      customerId: this.Authinfo.getOrgId(),
    }, {
      name: privateTrunkResource.name,
      address: privateTrunkResource.address,
      port: privateTrunkResource.port,
    }).$promise;
  }

}
