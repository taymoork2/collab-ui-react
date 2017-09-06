import { INumberData } from 'modules/call/features/paging-group/shared';
import { NumberType, NumberService } from 'modules/huron/numbers';

export class PagingNumberService {
  public hasLocations: boolean = false;

  /* @ngInject */
  constructor(
    private NumberService: NumberService,
    private $resource: ng.resource.IResourceService,
    private HuronConfig,
    private Authinfo,
    private FeatureToggleService,
  ) {
    // TODO: samwi - remove when locations is GA
    this.FeatureToggleService.supports(FeatureToggleService.features.hI1484).then(supports => {
      this.hasLocations = supports;
    });
  }

  public getNumberSuggestions(hint?: string): ng.IPromise<INumberData[]> {
    return this.NumberService.getNumberList(hint, NumberType.INTERNAL, false).then(
      (response) => _.map(response, (dn: any) => {
        return <INumberData>{
          extension: this.hasLocations ? dn.siteToSite : dn.number,
          extensionUUID: dn.uuid,
        };
      }));
  }

  // The uuid below should be pagingGroup's id, will call features API to get number
  public getNumberExtension(uuid: string): ng.IPromise<INumberData> {
    return this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/features/paging/:pagingId/numbers').get({
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
}
