export interface IDirectoryNumber {
  pattern: string,
}

export class DirectoryNumberOptionsService {
  private internalNumbersOptions: ng.resource.IResourceClass<ng.resource.IResource<IDirectoryNumber>>;
  private externalNumbersOptions: ng.resource.IResourceClass<ng.resource.IResource<IDirectoryNumber>>;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig
  ) {
    this.internalNumbersOptions = $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/internalnumberpools/:internalNumberId');
    this.externalNumbersOptions = $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/externalnumberpools/:externalNumberId');
  }

  public getInternalNumberOptions(): ng.IPromise<string[]> {
    return this.internalNumbersOptions.query({
      customerId: this.Authinfo.getOrgId(),
      directorynumber: '',
      order: 'pattern',
    }).$promise
    .then(options => {
      return _.map(options, 'pattern');
    });
  }

  public getExternalNumberOptions(): ng.IPromise<string[]> {
    return this.externalNumbersOptions.query({
      customerId: this.Authinfo.getOrgId(),
      directorynumber: '',
      order: 'pattern',
    }).$promise
    .then(options => {
      return _.map(options, 'pattern');
    });
  }
}