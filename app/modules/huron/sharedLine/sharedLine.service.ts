import { SharedLine, SharedLinePlace, SharedLineUser, SharedLinePhone, SharedLinePhoneListItem } from './sharedLine';
import { LineConsumerType } from '../lines/services';
import { Member, USER_PLACE } from '../members';

interface ISharedLineResource extends ng.resource.IResourceClass<ng.resource.IResource<SharedLine>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

interface ISharedLinePhoneResource extends ng.resource.IResourceClass<ng.resource.IResource<SharedLinePhone>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

export class SharedLineService {
  private sharedLineResource: ISharedLineResource;
  private sharedLinePhoneResource: ISharedLinePhoneResource;

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

    this.sharedLineResource = <ISharedLineResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/:type/:typeId/numbers/:numberId/features/sharedlines/:sharedLineId', {},
      {
        update: updateAction,
        save: saveAction,
      });

    this.sharedLinePhoneResource = <ISharedLinePhoneResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/:type/:typeId/numbers/:numberId/features/sharedlines/:sharedLineId/phones/:phoneId', {},
      {
        update: updateAction,
      });
  }

  public getSharedLine(type: LineConsumerType, typeId: string, numberId: string, sharedLineId: string): ng.IPromise<SharedLine> {
    return this.sharedLineResource.get({
      customerId: this.Authinfo.getOrgId(),
      type: type,
      typeId: typeId,
      numberId: numberId,
      sharedLineId: sharedLineId,
    }).$promise;
  }

  public getSharedLineList(type: LineConsumerType, typeId: string, numberId: string | undefined): ng.IPromise<SharedLine[]> {
    return this.sharedLineResource.get({
      customerId: this.Authinfo.getOrgId(),
      type: type,
      typeId: typeId,
      numberId: numberId,
    }).$promise
      .then(sharedLineList => {
        return _.map(_.get<SharedLine[]>(sharedLineList, 'sharedLines', []), (sharedLine) => {
          return new SharedLine({
            uuid: sharedLine.uuid,
            primary: sharedLine.primary,
            place: new SharedLinePlace({
              uuid: sharedLine.place.uuid,
              displayName: sharedLine.place.displayName,
            }),
            user: new SharedLineUser({
              uuid: sharedLine.user.uuid,
              firstName: sharedLine.user.firstName,
              lastName: sharedLine.user.lastName,
              userName: sharedLine.user.userName,
            }),
            phones: new Array<SharedLinePhone>(),
          });
        });
      });
  }

  public createSharedLine(type: LineConsumerType, typeId: string, numberId: string, data: Member): ng.IPromise<string> {
    let location: string;
    let payload: Object = {};
    if (data.type === USER_PLACE) {
      payload = {
        place: {
          uuid: data.uuid,
        },
      };
    } else {
      payload = {
        user: {
          uuid: data.uuid,
          userName: data.userName,
        },
      };
    }
    return this.sharedLineResource.save({
      customerId: this.Authinfo.getOrgId(),
      type: type,
      typeId: typeId,
      numberId: numberId,
    }, payload, (_response, headers) => {
      location = headers('Location');
    }).$promise
      .then( () => location);
  }

  public deleteSharedLine(type: LineConsumerType, typeId: string, numberId: string = '', sharedLineId: string): ng.IPromise<any> {
    return this.sharedLineResource.remove({
      customerId: this.Authinfo.getOrgId(),
      type: type,
      typeId: typeId,
      numberId: numberId,
      sharedLineId: sharedLineId,
    }).$promise;
  }

  public getSharedLinePhoneList(type: LineConsumerType, typeId: string, numberId: string, sharedLineId: string): ng.IPromise<SharedLinePhone[]> {
    return this.sharedLinePhoneResource.get({
      customerId: this.Authinfo.getOrgId(),
      type: type,
      typeId: typeId,
      numberId: numberId,
      sharedLineId: sharedLineId,
    }).$promise
      .then(sharedLinePhoneList => {
        const sharedLinePhones = _.get<SharedLinePhone[]>(sharedLinePhoneList, 'phones', []);
        return _.map(sharedLinePhones, (phone) => {
          return new SharedLinePhone({
            uuid: phone.uuid,
            description: phone.description,
            assigned: phone.assigned,
          });
        });
      });
  }

  public updateSharedLinePhoneList(type: LineConsumerType, typeId: string, numberId: string, sharedLineId: string, data: SharedLinePhoneListItem[]): ng.IPromise<void> {
    return this.sharedLinePhoneResource.update({
      customerId: this.Authinfo.getOrgId(),
      type: type,
      typeId: typeId,
      numberId: numberId,
      sharedLineId: sharedLineId,
    }, {
      phones: _.map(data, (phone) => {
        return {
          uuid: phone.uuid,
        };
      }),
    }).$promise;
  }

}
