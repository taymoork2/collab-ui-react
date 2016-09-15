export class Number {
  uuid: string;
  primary: boolean = false;
  internal: string;
  external: string;
  siteToSite: string;
  incomingCallMaximum: number = 2;
};

interface INumberResource extends ng.resource.IResourceClass<ng.resource.IResource<Number>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<Number>>;
}

export class LineConsumerType {
  static USERS = 'users';
  static PLACES = 'places';
}

export class LineService {
  private lineService: INumberResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig
  ) {

    let updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    }

    this.lineService = <INumberResource>$resource(HuronConfig.getCmiV2Url() + '/customers/:customerId/:type/:typeId/numbers/:numberId', {},
      {
        update: updateAction,
      });
  }

  public getLine(type: LineConsumerType, typeId: string, numberId: string): ng.IPromise<Number> {
    return this.lineService.get({
      customerId: this.Authinfo.getOrgId(),
      type: type,
      typeId: typeId,
      numberId: numberId,
    }).$promise;
  }

  public getLineList(type: LineConsumerType, typeId: string): ng.IPromise<ng.resource.IResourceArray<ng.resource.IResource<Number>>> {
    return this.lineService.query({
      customerId: this.Authinfo.getOrgId(),
      type: type,
      typeId: typeId,
    }).$promise;
  }

  public createLine(type: LineConsumerType, typeId: string, data: Number): ng.IPromise<Number> {
    return this.lineService.save({
      customerId: this.Authinfo.getOrgId(),
      type: type,
      typeId: typeId,
    }, data).$promise;
  }

  public updateLine(type: LineConsumerType, typeId: string, numberId: string, data: Number): ng.IPromise<Number> {
    return this.lineService.update({
      customerId: this.Authinfo.getOrgId(),
      type: type,
      typeId: typeId,
      numberId: numberId,
    }, {
      internal: data.internal,
      external: data.external,
      incomingCallMaximum: data.incomingCallMaximum,
    }).$promise;
  }

}