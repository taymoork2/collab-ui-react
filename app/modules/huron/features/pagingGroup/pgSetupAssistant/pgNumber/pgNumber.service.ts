export interface INumber extends ng.resource.IResource<INumber> {
  directoryNumber: any;
  number: string;
  type: string;
  uuid: string;
}

export class PagingNumberService {

  /* @ngInject */
  constructor(private NumberSearchServiceV2,
              private Authinfo) {
  }

  public getNumberSuggestions(hint): ng.IPromise<INumber[]> {
    return this.NumberSearchServiceV2.get({
      customerId: this.Authinfo.getOrgId(),
      number: hint,
      assigned: false,
    }).$promise;
  }

}
