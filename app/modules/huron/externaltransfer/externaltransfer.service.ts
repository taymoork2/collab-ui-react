interface IExternalTransferResource extends ng.resource.IResourceClass<ng.resource.IResource<any>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}
export class ExternalTransferService {
  private extTransferResourceUser: IExternalTransferResource;

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
  }

  public getDefaultSettingForUser(userId: string): ng.IPromise<string> {
    return this.extTransferResourceUser.get({
      customerId: this.Authinfo.getOrgId(),
      userId: userId,
    }).$promise.then(settings => {
      return _.get(settings, 'allowExternalTransfer');
    });
  }

  public updateSettingsForUser(userId: string, allowExternalTransfer: string): ng.IPromise<void> {
    return this.extTransferResourceUser.update({
      customerId: this.Authinfo.getOrgId(),
      userId: userId,
    }, { allowExternalTransfer: allowExternalTransfer }).$promise;
  }
}
