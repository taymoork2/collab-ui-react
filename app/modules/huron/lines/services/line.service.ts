export const LINE_CHANGE = 'LINE_CHANGE';

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

    let saveAction: ng.resource.IActionDescriptor = {
      method: 'POST',
      headers: {
        'Access-Control-Expose-Headers': 'Location'
      },
    };

    this.lineService = <INumberResource>$resource(HuronConfig.getCmiV2Url() + '/customers/:customerId/:type/:typeId/numbers/:numberId', {},
      {
        update: updateAction,
        save: saveAction,
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

  public getLineList(type: LineConsumerType, typeId: string): ng.IPromise<Number[]> {
    return this.lineService.get({
      customerId: this.Authinfo.getOrgId(),
      type: type,
      typeId: typeId,
    }).$promise
    .then(lineList => {
      return _.get<Number[]>(lineList, 'numbers', []);
    });
  }

  public createLine(type: LineConsumerType, typeId: string, data: Number): ng.IPromise<string> {
    let location: string;
    return this.lineService.save({
      customerId: this.Authinfo.getOrgId(),
      type: type,
      typeId: typeId,
    }, {
      internal: data.internal,
      external: data.external,
      incomingCallMaximum: data.incomingCallMaximum,
    }, (response, headers) => {
      location = headers('Location');
    }).$promise
    .then( () => location);
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

  public deleteLine(type: LineConsumerType, typeId: string, numberId: string): ng.IPromise<any> {
    return this.lineService.remove({
      customerId: this.Authinfo.getOrgId(),
      type: type,
      typeId: typeId,
      numberId: numberId,
    }).$promise
  }

}