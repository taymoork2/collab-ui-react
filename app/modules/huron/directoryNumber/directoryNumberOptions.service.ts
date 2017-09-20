import { NumberType } from 'modules/huron/numbers';

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
  private locationsInternalNumbersOptions: ng.resource.IResourceClass<ng.resource.IResource<IDirectoryNumber>>;
  private internalNumbersOptions: ng.resource.IResourceClass<ng.resource.IResource<IDirectoryNumber>>;
  private externalNumbersOptions: ng.resource.IResourceClass<ng.resource.IResource<IDirectoryNumber>>;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
    private FeatureToggleService,
    private NumberService,
  ) {
    this.locationsInternalNumbersOptions = this.$resource(this.HuronConfig.getCmiUrl() + '/voice/customers/:customerId/locations/:locationId/internalnumberpools');
    this.internalNumbersOptions = this.$resource(this.HuronConfig.getCmiUrl() + '/voice/customers/:customerId/internalnumberpools/:internalNumberId');
    this.externalNumbersOptions = this.$resource(this.HuronConfig.getCmiUrl() + '/voice/customers/:customerId/externalnumberpools/:externalNumberId');
  }

  public getInternalNumberOptions(pattern?: string | Pattern, assignment?: Availability, locationId?: string): ng.IPromise<string[]> {
    return this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1484)
      .then(isSupported => {
        if (isSupported && locationId && !_.isUndefined(locationId)) {
          return this.loadLocationsInternalNumberPool(pattern, assignment, locationId);
        } else {
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
      });
  }

  public loadLocationsInternalNumberPool(pattern?: string | Pattern, assignment?: Availability, locationId?: string): ng.IPromise<string[]> {
    const directorynumber = assignment || Availability.UNASSIGNED;
    return this.NumberService.getNumberList(pattern, NumberType.INTERNAL, directorynumber, null, null, null, locationId)
      .then(options => {
        return _.map(options, 'internal');
      });
  }

  public getExternalNumberOptions(pattern?: string | Pattern, assignment?: Availability, externalNumberType?: ExternalNumberType): ng.IPromise<string[]> {
    const queries = {
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
