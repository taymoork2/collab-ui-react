import { INumberData, IRPagingGroupNumber, PagingGroupNumber } from 'modules/call/features/paging-group/shared';
import { NumberType, NumberService, NumberOrder } from 'modules/huron/numbers';

interface IPagingGroupNumbersResource extends ng.resource.IResourceClass<ng.resource.IResource<IRPagingGroupNumber>> {}

export class PagingNumberService {
  public hasLocations: boolean = false;

  private pagingGroupNumbersResource: IPagingGroupNumbersResource;

  /* @ngInject */
  constructor(
    private NumberService: NumberService,
    private $resource: ng.resource.IResourceService,
    private HuronConfig,
    private Authinfo,
    private FeatureToggleService,
  ) {
    this.pagingGroupNumbersResource = <IPagingGroupNumbersResource>this.$resource(`${this.HuronConfig.getCmiV2Url()}/customers/:customerId/features/paging/:pagingId/numbers`, {});

    // TODO: samwi - remove when locations is GA
    this.FeatureToggleService.supports(FeatureToggleService.features.hI1484).then(supports => {
      this.hasLocations = supports;
    });
  }

  // TODO (jlowery): DELETE after pg setup wizard is refactored
  public getNumberSuggestions(hint?: string): ng.IPromise<INumberData[]> {
    return this.NumberService.getNumberList(hint, NumberType.INTERNAL, false).then(
      (response) => _.map(response, (dn: any) => {
        return <INumberData>{
          extension: this.hasLocations ? dn.siteToSite : dn.number,
          extensionUUID: dn.uuid,
        };
      }));
  }

  public getInternalNumbers(filter?: string): ng.IPromise<string[]> {
    return this.NumberService.getNumberList(filter, NumberType.INTERNAL, false, NumberOrder.SITETOSITE_ASC)
      .then(response => _.map(response, dn => {
        return this.hasLocations ? dn.siteToSite || '' : dn.number;
      }));
  }

  // The uuid below should be pagingGroup's id, will call features API to get number
  public getNumberExtension(uuid: string): ng.IPromise<INumberData> {
    return this.pagingGroupNumbersResource.get({
      customerId: this.Authinfo.getOrgId(),
      pagingId: uuid,
    }).$promise.then(response => {
      const numbers =  _.map(_.get(response, 'numbers', []), 'number');
      const numberData: INumberData = <INumberData> {
        extension: undefined,
        extensionUUID: undefined,
      };
      if (numbers.length > 0 ) {
        numberData.extension = numbers[0];
      }
      return numberData;
    });
  }

  public getNumbers(uuid: string): ng.IPromise<PagingGroupNumber[]> {
    return this.pagingGroupNumbersResource.get({
      customerId: this.Authinfo.getOrgId(),
      pagingId: uuid,
    }).$promise.then(response => {
      return _.map(_.get(response, 'numbers', []), number => {
        return new PagingGroupNumber(number);
      });
    });
  }
}
