import { INumber, NumberType } from './number';

export enum NumberOrder {
  ASCENDING = 'asc',
  DESCENDING = 'desc',
  SITETOSITE_ASC = 'SITETOSITE-ASC',
}

interface INumberResource extends ng.resource.IResourceClass<ng.resource.IResource<INumber>> {}

export class NumberService {
  private numberResource: INumberResource;
  private userNumberResource: INumberResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
    private FeatureToggleService,
  ) {
    this.numberResource = <INumberResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/numbers/:numberUuid');
    this.userNumberResource = <INumberResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/users/:userId/numbers/:numberUuid');
  }

  public getNumberList(number?: string, type?: NumberType, assigned?: boolean, order?: NumberOrder, limit?: number, offset?: number, locationId?: string): ng.IPromise<INumber[]> {
    return  this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1484)
    .then(supports => {
      return this.numberResource.get({
        customerId: this.Authinfo.getOrgId(),
        number: number,
        type: type,
        assigned: assigned,
        order: order,
        limit: limit,
        offset: offset,
        location: locationId,
        deprecated: !supports,
      }).$promise
        .then(numberList => {
          return _.get(numberList, 'numbers', []);
        });
    });
  }

  public getNumber(number: string): any {
    return  this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1484)
    .then(supports => {
      return this.numberResource.get({
        customerId: this.Authinfo.getOrgId(),
        numberUuid: number,
        deprecated: !supports,
        wide: true,
      }).$promise;
    });
  }

  public getUserNumber(userId, numberId): ng.IPromise<any> {
    return this.userNumberResource.get({
      customerId: this.Authinfo.getOrgId(),
      userId: userId,
      numberId: numberId,
    }).$promise;
  }
}
