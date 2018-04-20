export interface IPhoneButton {
  edit?: boolean;
  type: string;
  index: number;
  destination: string;
  label: string;
  callPickupEnabled: boolean;
  appliesToSharedLines: boolean;
  isEditable?: boolean;
  isDeletable?: boolean;
}

interface IDialResource extends ng.resource.IResourceClass<ng.resource.IResource<{buttonLayout: IPhoneButton[]}>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<boolean>>;
}

export class PhoneButtonLayoutService {
  private dialService: IDialResource;
  /* @ngInject */
  constructor(
    private Authinfo,
    private $resource: ng.resource.IResourceService,
    private HuronConfig,
  ) {

    const updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };
    this.dialService = <IDialResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/:type/:userId/buttonlayouts', {}, {
      update: updateAction,
    });
  }

  public getPhoneButtons(_type: string, _id: string): ng.IPromise<{buttonLayout: IPhoneButton[]}> {
    return this.dialService.get({
      type: _type,
      customerId: this.Authinfo.getOrgId(),
      userId: _id,
    }).$promise;
  }

  public updatePhoneButtons(_type: string, _id: string, _list: IPhoneButton[]): ng.IPromise<boolean> {
    const data: { buttonLayout: IPhoneButton[] } = {
      buttonLayout: [],
    };
    _.each(_list, function (phoneButton) {
      data.buttonLayout.push({
        type: phoneButton.type,
        index: phoneButton.index,
        destination: phoneButton.destination,
        label: phoneButton.label,
        callPickupEnabled: phoneButton.callPickupEnabled,
        appliesToSharedLines: phoneButton.appliesToSharedLines,
      });
    });
    return this.dialService.update({
      type: _type,
      customerId: this.Authinfo.getOrgId(),
      userId: _id,
    }, data).$promise;
  }
}
