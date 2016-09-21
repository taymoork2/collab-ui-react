export const LINE_CHANGE = 'LINE_CHANGE';

export class Line {
  public uuid: string;
  public primary: boolean = false;
  public internal: string;
  public external: string;
  public siteToSite: string;
  public incomingCallMaximum: number = 2;
}

interface ILineResource extends ng.resource.IResourceClass<ng.resource.IResource<Line>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<Line>>;
}

export class LineConsumerType {
  public static USERS = 'users';
  public static PLACES = 'places';
}

export class LineService {
  private lineService: ILineResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig
  ) {

    let updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };

    let saveAction: ng.resource.IActionDescriptor = {
      method: 'POST',
      headers: {
        'Access-Control-Expose-Headers': 'Location',
      },
    };

    this.lineService = <ILineResource>$resource(HuronConfig.getCmiV2Url() + '/customers/:customerId/:type/:typeId/numbers/:numberId', {},
      {
        update: updateAction,
        save: saveAction,
      });
  }

  public getLine(type: LineConsumerType, typeId: string, numberId: string): ng.IPromise<Line> {
    return this.lineService.get({
      customerId: this.Authinfo.getOrgId(),
      type: type,
      typeId: typeId,
      numberId: numberId,
    }).$promise;
  }

  public getLineList(type: LineConsumerType, typeId: string): ng.IPromise<Line[]> {
    return this.lineService.get({
      customerId: this.Authinfo.getOrgId(),
      type: type,
      typeId: typeId,
    }).$promise
    .then(lineList => {
      return _.get<Line[]>(lineList, 'numbers', []);
    });
  }

  public createLine(type: LineConsumerType, typeId: string, data: Line): ng.IPromise<string> {
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

  public updateLine(type: LineConsumerType, typeId: string, numberId: string, data: Line): ng.IPromise<Line> {
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
    }).$promise;
  }

}
