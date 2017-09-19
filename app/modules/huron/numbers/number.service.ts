import { INumber, NumberType } from './number';

export enum NumberOrder {
  ASCENDING = <any>'asc',
  DESCENDING = <any>'desc',
}

interface INumberResource extends ng.resource.IResourceClass<ng.resource.IResource<INumber>> {}

export class NumberService {
  private numberResource: INumberResource;
  private hasLocations: boolean = false;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
    private FeatureToggleService,
  ) {
    this.numberResource = <INumberResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/numbers/:numberUuid');
    this.FeatureToggleService.supports(FeatureToggleService.features.hI1484).then(supports => {
      this.hasLocations = supports;
    });
  }

  public getNumberList(number?: string, type?: NumberType, assigned?: boolean, order?: NumberOrder, limit?: number, offset?: number, locationId?: string): ng.IPromise<INumber[]> {
    return this.numberResource.get({
      customerId: this.Authinfo.getOrgId(),
      number: number,
      type: type,
      assigned: assigned,
      order: order,
      limit: limit,
      offset: offset,
      locationId: locationId,
      deprecated: !this.hasLocations,
    }).$promise
    .then(numberList => {
      return _.get(numberList, 'numbers', []);
    });
  }

  public getNumber(number: string): any {
    return this.numberResource.get({
      customerId: this.Authinfo.getOrgId(),
      numberUuid: number,
      deprecated: !this.hasLocations,
      wide: true,
    }).$promise;
  }
}
