import { INumberData } from 'modules/huron/features/pagingGroup/pagingGroup';

interface ISearchData {
  customerId: string;
  directorynumber: string;
  order: string;
  pattern?: string;
}

export class PagingNumberService {

  /* @ngInject */
  constructor(private InternalNumberPoolService,
              private $resource: ng.resource.IResourceService,
              private HuronConfig,
              private Authinfo) {
  }

  public getNumberSuggestions(hint?: string): ng.IPromise<INumberData[]> {
    let data: ISearchData = {
      customerId: this.Authinfo.getOrgId(),
      directorynumber: '',
      order: 'pattern',
    };
    if (hint) {
      data.pattern = '%' + hint + '%';
    }
    return this.InternalNumberPoolService.query(data).$promise.then(
      (response) => _.map(response, function (dn: any) {
        let numberData = <INumberData>{
          extension: dn.pattern,
          extensionUUID: dn.uuid,
        };
        return numberData;
      }));
  }

  public getNumberExtension(uuid: string): ng.IPromise<INumberData> {
    return this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/numbers/:numberId').get({
      customerId: this.Authinfo.getOrgId(),
      numberId: uuid,
    }).$promise.then(response => {
      let numberData: INumberData = <INumberData> {
        extension: response.number,
        extensionUUID: response.uuid,
      };
      return numberData;
    });
  }
}
