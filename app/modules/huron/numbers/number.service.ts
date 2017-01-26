import { INumber } from './number';

export enum NumberType {
  INTERNAL = <any>'internal',
  EXTERNAL = <any>'external',
}

export enum NumberOrder {
  ASCENDING = <any>'asc',
  DESCENDING = <any>'desc',
}

interface INumberResource extends ng.resource.IResourceClass<ng.resource.IResource<INumber>> {}

export class NumberService {
  private numberResource: INumberResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {
    this.numberResource = <INumberResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/numbers');
  }

  public getNumberList(number?: string, type?: NumberType, assigned?: boolean, order?: NumberOrder, limit?: number, offset?: number): ng.IPromise<Array<INumber>> {
    return this.numberResource.get({
      customerId: this.Authinfo.getOrgId(),
      number: number,
      type: type,
      assigned: assigned,
      order: order,
      limit: limit,
      offset: offset,
    }).$promise
    .then(numberList => {
      return _.get(numberList, 'numbers', []);
    });
  }
}
