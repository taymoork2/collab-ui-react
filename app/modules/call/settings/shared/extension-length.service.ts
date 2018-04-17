export interface IExtensionLength {
  length: string;
  prefix: string;
}

interface IExtensionLengthResource extends ng.resource.IResourceClass<ng.resource.IResource<IExtensionLength>> { }

export class ExtensionLengthService {
  private extensionLengthResource: IExtensionLengthResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {
    this.extensionLengthResource = <IExtensionLengthResource>this.$resource(this.HuronConfig.getCmiUrl() + '/voice/customers/:customerId/extensionlengths', {}, {});
  }

  public saveExtensionLength(length: number | null, prefix: number | null): ng.IPromise<IExtensionLength> {
    return this.extensionLengthResource.save({
      customerId: this.Authinfo.getOrgId(),
    }, <IExtensionLength>{
      length: _.isNull(length) ? null : _.toString(length),
      prefix: _.isNull(prefix) ? null : _.toString(prefix),
    }).$promise;
  }

}
