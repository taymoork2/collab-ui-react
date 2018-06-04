import { NumberType,  NumberService, NumberOrder, INumber } from 'modules/huron/numbers';

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
  private externalNumbersOptions: ng.resource.IResourceClass<ng.resource.IResource<IDirectoryNumber>>;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
    private FeatureToggleService,
    private NumberService: NumberService,
  ) {
    this.externalNumbersOptions = this.$resource(this.HuronConfig.getCmiUrl() + '/voice/customers/:customerId/externalnumberpools/:externalNumberId');
  }

  public getInternalNumberOptions(pattern?: string | undefined, locationId?: string): ng.IPromise<string[]> {
    return this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1484)
      .then(isSupported => {
        if (isSupported && locationId && !_.isUndefined(locationId)) {
          return this.loadLocationsInternalNumberPool(pattern, locationId);
        } else {
          return this.NumberService.getNumberList(pattern, NumberType.INTERNAL, false)
            .then(options => {
              return _.map(options, 'number');
            });
        }
      });
  }

  public loadLocationsInternalNumberPool(pattern: string | undefined, locationId?: string): ng.IPromise<INumber[]> {
    const order: NumberOrder = NumberOrder.SITETOSITE_ASC;
    return this.NumberService.getNumberList(pattern, NumberType.INTERNAL, false, order, undefined, undefined, locationId);
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
