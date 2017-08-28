interface IExternalTransferResource extends ng.resource.IResourceClass<ng.resource.IResource<any>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}
export class ExternalTransferService {
  private extTransferResourceUser: IExternalTransferResource;
  private extTransferResourcePlace: IExternalTransferResource;
  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {
    this.extTransferResourceUser = <IExternalTransferResource>this.$resource(this.HuronConfig.getCmiUrl() + '/voice/customers/:customerId/users/:userId', {},
      {
        update: {
          method: 'PUT',
        },
      });
    this.extTransferResourcePlace = <IExternalTransferResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/places/:placeId', {},
      {
        update: {
          method: 'PUT',
        },
      });

  }

  public getDefaultSetting(memberId: string, memberType: string): ng.IPromise<boolean | null> {
    if (memberType === 'users') {
      return this.extTransferResourceUser.get({
        customerId: this.Authinfo.getOrgId(),
        userId: memberId,
      }).$promise.then(settings => {
        // Convert string to boolean as temporary fix until V2 update is pushed
        if ('Off' === _.get(settings, 'allowExternalTarnsfer')) {
          return false;
        } else if ('On' === _.get(settings, 'allowExternalTransfer')) {
          return true;
        } else {
          return null;
        }
      });
    } else {
      return this.extTransferResourcePlace.get({
        customerId: this.Authinfo.getOrgId(),
        placeId: memberId,
      }).$promise.then(settings => {
        return _.get(settings, 'allowExternalTransfer');
      });
    }
  }

  public updateSettings(memberId: string, memberType: string, allowExternalTransfer: boolean | null): ng.IPromise<void> {
    if (memberType === 'users') {
      // Convert bool to string, temporary fix until V2 update is pushed
      let v1AllowExternalTransfer = <string>'';
      if (allowExternalTransfer === true) {
        v1AllowExternalTransfer = 'On';
      } else if (allowExternalTransfer === false) {
        v1AllowExternalTransfer = 'Off';
      } else {
        v1AllowExternalTransfer = 'Default';
      }
      return this.extTransferResourceUser.update({
        customerId: this.Authinfo.getOrgId(),
        userId: memberId,
      }, { allowExternalTransfer: v1AllowExternalTransfer }).$promise;
    } else {
      return this.extTransferResourcePlace.update({
        customerId: this.Authinfo.getOrgId(),
        placeId: memberId,
      }, { allowExternalTransfer: allowExternalTransfer }).$promise;
    }
  }
}
