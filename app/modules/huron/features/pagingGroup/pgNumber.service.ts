export interface INumber extends ng.resource.IResource<INumber> {
  uuid: string;
  number: string;
}

interface ISearchData {
  customerId: string;
  directorynumber: string;
  order: string;
  pattern?: string;
}

export class PagingNumberService {

  /* @ngInject */
  constructor(private InternalNumberPoolService,
              private Authinfo) {
  }

  public getNumberSuggestions(hint?: string): ng.IPromise<INumber[]> {
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
      return <INumber>{
        uuid: dn.uuid,
        number: dn.pattern,
      };
    }));
  }

}
