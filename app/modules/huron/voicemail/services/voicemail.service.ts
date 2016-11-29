interface IUserCommon {
  uuid: string;
  firstName: string;
  lastName: string;
  userName: string;
  services: Array<string>;
}

interface IDnUsers {
  user: {
    uuid: string;
    userId: string;
  };
  dnUsage: string;
}

interface IUserCommonResource extends ng.resource.IResourceClass<ng.resource.IResource<IUserCommon>> {}
interface IDirectoryNumberUsersResource extends ng.resource.IResourceClass<ng.resource.IResource<IDnUsers>> {}

export class VoicemailService {
  private userCommonResource: IUserCommonResource;
  private directoryNumbersUsersResource: IDirectoryNumberUsersResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {

    this.directoryNumbersUsersResource = <IDirectoryNumberUsersResource>this.$resource(this.HuronConfig.getCmiUrl() + '/voice/customers/:customerId/directorynumbers/:directoryNumberId/users/:userId');
    this.userCommonResource = <IUserCommonResource>this.$resource(this.HuronConfig.getCmiUrl() + '/common/customers/:customerId/users/:userId');
  }

  /**
   * Given the uuid of a DN, check if voicemail is
   * enabled for the user this DN is the Primary line for.
   * @param {numberUuid} - Uuid of DN
   * @return {boolean}
   */
  public isVoiceMailEnabledForDnOwner(numberUuid): ng.IPromise<boolean> {
    return this.directoryNumbersUsersResource.query({
      customerId: this.Authinfo.getOrgId(),
      directoryNumberId: numberUuid,
    }).$promise.then( users => {
      let user = _.find(users, { dnUsage: 'Primary' });
      return _.get(user, 'user.uuid', '');
    }).then( uuid => {
      return this.userCommonResource.get({
        customerId: this.Authinfo.getOrgId(),
        userId: uuid,
      }).$promise.then( user => {
        return _.indexOf(_.get(user, 'services', []), 'VOICEMAIL') !== -1;
      });
    });
  }

}
