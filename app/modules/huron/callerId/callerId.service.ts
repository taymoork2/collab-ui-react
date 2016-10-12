interface ICallerIDResource extends ng.resource.IResourceClass<ng.resource.IResource<Array<any>>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<any>>;
}
export class CallerIDService {
  private callerIDService: ICallerIDResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {
    let updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };

    this.callerIDService = <ICallerIDResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/:type/:typeId/numbers/:numberId/features/callerids', {},
      {
        update: updateAction,
      });
  }

  public getCallerId(_type, _typeId, _numberId) {
    return this.callerIDService.get({
      customerId: this.Authinfo.getOrgId(),
      type: _type,
      typeId: _typeId,
      numberId: _numberId,
    }).$promise;
  }

  public updateCallerId(_type, _typeId, _numberId, data) {
    let result = _.cloneDeep(data);
    delete result.url;
    delete result.callerIdSelected;
    return this.callerIDService.update({
      customerId: this.Authinfo.getOrgId(),
      type: _type,
      typeId: _typeId,
      numberId: _numberId,
    }, result).$promise;
  }
}
