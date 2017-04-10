export interface IDirectoryNumber {
  pattern: string;
}

export enum Availability {
  ASSIGNED_AND_UNASSIGNED = <any>undefined,
  UNASSIGNED = <any>'',
}

export enum ExternalNumberType {
  ALL = <any>undefined,
  DID = <any>'Fixed Line or Mobile',
  TOLLFREE = <any>'Toll Free',
}

export enum Pattern {
  SKIP_MATCHING = <any>undefined,
}

export class DirectoryNumberOptionsService {
  private internalNumbersOptions: ng.resource.IResourceClass<ng.resource.IResource<IDirectoryNumber>>;
  private externalNumbersOptions: ng.resource.IResourceClass<ng.resource.IResource<IDirectoryNumber>>;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {
    this.internalNumbersOptions = this.$resource(this.HuronConfig.getCmiUrl() + '/voice/customers/:customerId/internalnumberpools/:internalNumberId');
    this.externalNumbersOptions = this.$resource(this.HuronConfig.getCmiUrl() + '/voice/customers/:customerId/externalnumberpools/:externalNumberId');
  }

  public getInternalNumberOptions(pattern?: string | Pattern, assignment?: Availability): ng.IPromise<string[]> {
    return this.internalNumbersOptions.query({
      customerId: this.Authinfo.getOrgId(),
      directorynumber: assignment || Availability.UNASSIGNED,
      order: 'pattern',
      pattern: pattern ? '%' + pattern + '%' : undefined,
    }).$promise
    .then(options => {
      return _.map(options, 'pattern');
    });
  }

  public getExternalNumberOptions(pattern?: string | Pattern, assignment?: Availability, externalNumberType?: ExternalNumberType): ng.IPromise<string[]> {
    let queries = {
      customerId: this.Authinfo.getOrgId(),
      directorynumber: assignment || Availability.UNASSIGNED,
      externalnumbertype: externalNumberType || ExternalNumberType.DID,
      order: 'pattern',
      pattern: pattern ? '%' + pattern + '%' : undefined,
    };
    return this.externalNumbersOptions.query(queries).$promise
    .then(options => {
      return _.map(options, 'pattern');
    });
  }
}
