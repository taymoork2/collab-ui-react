interface IRoutingPrefixLengthResource extends ng.resource.IResourceClass<ng.resource.IResource<string>> { }

export class RoutingPrefixLengthService {
  private routingPrefixLengthResource: IRoutingPrefixLengthResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {
    this.routingPrefixLengthResource = <IRoutingPrefixLengthResource>this.$resource(this.HuronConfig.getCmiUrl() + '/voice/customers/:customerId/routingprefixes', {}, {});
  }

  public saveRoutingPrefixLength(length: string): ng.IPromise<string> {
    return this.routingPrefixLengthResource.save({
      customerId: this.Authinfo.getOrgId(),
    }, {
      prefix: length,
    }).$promise;
  }

}
