import { INumberData } from 'modules/call/features/paging-group/shared';
import { NumberType, NumberService } from 'modules/huron/numbers';

export class PagingNumberService {

  /* @ngInject */
  constructor(
    private NumberService: NumberService,
    private $resource: ng.resource.IResourceService,
    private HuronConfig,
    private Authinfo,
  ) {}

  public getNumberSuggestions(hint?: string): ng.IPromise<INumberData[]> {
    return this.NumberService.getNumberList(hint, NumberType.INTERNAL, false).then(
      (response) => _.map(response, function (dn: any) {
        const numberData = <INumberData>{
          extension: dn.number,
          extensionUUID: dn.uuid,
        };
        return numberData;
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
