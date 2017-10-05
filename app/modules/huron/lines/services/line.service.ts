import { Line } from './line';

export const LINE_CHANGE = 'LINE_CHANGE';

interface ILineResource extends ng.resource.IResourceClass<ng.resource.IResource<Line>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
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
    private HuronConfig,
  ) {

    const updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };

    const saveAction: ng.resource.IActionDescriptor = {
      method: 'POST',
      headers: {
        'Access-Control-Expose-Headers': 'Location',
      },
    };

    this.lineService = <ILineResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/:type/:typeId/numbers/:numberId', { wide: false },
      {
        update: updateAction,
        save: saveAction,
      });
  }

  public getLine(type: LineConsumerType, typeId: string, numberId: string, wide?: boolean): ng.IPromise<Line> {
    return this.lineService.get({
      customerId: this.Authinfo.getOrgId(),
      type: type,
      typeId: typeId,
      numberId: numberId,
      wide: wide,
    }).$promise;
  }

  public getLineList(type: LineConsumerType, typeId: string, wide?: boolean): ng.IPromise<Line[]> {
    return this.lineService.get({
      customerId: this.Authinfo.getOrgId(),
      type: type,
      typeId: typeId,
      wide: wide,
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
    }, (_response, headers) => {
      location = headers('Location');
    }).$promise
    .then( () => location);
  }

  public updateLine(type: LineConsumerType, typeId: string, numberId: string, data: Line): ng.IPromise<void> {
    return this.lineService.update({
      customerId: this.Authinfo.getOrgId(),
      type: type,
      typeId: typeId,
      numberId: numberId,
    }, {
      internal: data.internal,
      external: _.isUndefined(data.external) ? null : data.external,
      incomingCallMaximum: data.incomingCallMaximum,
      label: _.isNull(data.label) ? null : data.label,
    }).$promise;
  }

  public deleteLine(type: LineConsumerType, typeId: string, numberId: string | undefined): ng.IPromise<any> {
    return this.lineService.remove({
      customerId: this.Authinfo.getOrgId(),
      type: type,
      typeId: typeId,
      numberId: numberId,
    }).$promise;
  }

}
