export interface ISpeedDial {
  edit?: boolean;
  label: string;
  number: string;
  index: number;
  callPickupEnabled?: boolean;
}

interface IDialResource extends ng.resource.IResourceClass<ng.resource.IResource<{speedDials: ISpeedDial[]}>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<boolean>>;
}

export class SpeedDialService {
  private dialService: IDialResource;
  /* @ngInject */
  constructor(
    private Authinfo,
    private $resource: ng.resource.IResourceService,
    private UserServiceCommon,
    private HuronConfig) {

    let updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };
    this.dialService = <IDialResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/:type/:userId/features/:bulk/speeddials', {}, {
      update: updateAction,
    });
  }

  public getSpeedDials(_type: string, _id: string): ng.IPromise<{speedDials: ISpeedDial[]}> {
    return this.dialService.get({
      type: _type,
      customerId: this.Authinfo.getOrgId(),
      userId: _id,
    }).$promise;
  }

  public getUserName(userId: string): ng.IPromise<string> {
    return this.UserServiceCommon.get({
      customerId: this.Authinfo.getOrgId(),
      userId: userId,
    }).$promise
      .then((user) => {
        return user;
      });
  }

  public updateSpeedDials(_type: string, _id: string, _list: ISpeedDial[]): ng.IPromise<boolean> {
    let data: { speedDials: ISpeedDial[] } = {
      speedDials: [],
    };
    _.each(_list, function (sd) {
      data.speedDials.push({
        index: sd.index,
        number: sd.number,
        label: sd.label,
        callPickupEnabled: sd.callPickupEnabled,
      });
    });
    return this.dialService.update({
      type: _type,
      customerId: this.Authinfo.getOrgId(),
      userId: _id,
      bulk: 'bulk',
    }, data).$promise;
  }
}
