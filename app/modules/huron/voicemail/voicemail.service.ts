import { Customer, HuronCustomerService, Link } from 'modules/huron/customer';
import { HuronUserService, UserV1, Voicemail } from 'modules/huron/users';

interface IUserCommon {
  uuid: string;
  firstName: string;
  lastName: string;
  userName: string;
  services: string[];
}

interface IDnUsers {
  user: {
    uuid: string;
    userId: string;
  };
  dnUsage: string;
}

interface IUserCommonResource extends ng.resource.IResourceClass<ng.resource.IResource<IUserCommon>> { }
interface IDirectoryNumberUsersResource extends ng.resource.IResourceClass<ng.resource.IResource<IDnUsers>> { }

const VOICEMAIL = 'VOICEMAIL';
const AVRIL = 'AVRIL';

export const VOICEMAIL_CHANGE = 'VOICEMAIL_CHANGE';

export class HuronVoicemailService {
  private userCommonResource: IUserCommonResource;
  private directoryNumbersUsersResource: IDirectoryNumberUsersResource;

  /* @ngInject */
  constructor(
    private HuronCustomerService: HuronCustomerService,
    private HuronUserService: HuronUserService,
    private FeatureToggleService,
    private $q: ng.IQService,
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {
    this.directoryNumbersUsersResource = <IDirectoryNumberUsersResource>this.$resource(this.HuronConfig.getCmiUrl() + '/voice/customers/:customerId/directorynumbers/:directoryNumberId/users/:userId');
    this.userCommonResource = <IUserCommonResource>this.$resource(this.HuronConfig.getCmiUrl() + '/common/customers/:customerId/users/:userId');
  }

  public isEnabledForCustomer(): ng.IPromise<boolean> {
    let isEnabled = false;
    return this.HuronCustomerService.getCustomer().then((customer: Customer) => {
      _.forEach(_.get<Link[]>(customer, 'links'), link => {
        if (link.rel === _.toLower(VOICEMAIL) || this.isFeatureEnabledAvril() && link.rel === _.toLower(AVRIL)) {
          isEnabled = true;
        }
      });
      return isEnabled;
    });
  }

  public isEnabledForUser(services: string[]): boolean {
    return _.includes(services, VOICEMAIL) || _.includes(services, AVRIL);
  }

  /**
   * Given the uuid of a DN, check if voicemail is
   * enabled for the user this DN is the Primary line for.
   * @param {numberUuid} - Uuid of DN
   * @return {boolean}
   */
  public isEnabledForDnOwner(numberUuid): ng.IPromise<boolean> {
    return this.directoryNumbersUsersResource.query({
      customerId: this.Authinfo.getOrgId(),
      directoryNumberId: numberUuid,
    }).$promise.then(users => {
      const user = _.find(users, { dnUsage: 'Primary' });
      return _.get(user, 'user.uuid', '');
    }).then(uuid => {
      return this.userCommonResource.get({
        customerId: this.Authinfo.getOrgId(),
        userId: uuid,
      }).$promise.then(user => {
        return _.indexOf(_.get(user, 'services', []), VOICEMAIL) !== -1 || _.indexOf(_.get(user, 'services', []), AVRIL) !== -1;
      });
    });
  }

  public isFeatureEnabledAvril(): ng.IPromise<boolean> {
    return this.$q.all([
      this.FeatureToggleService.supports(this.FeatureToggleService.features.avrilVmEnable),
      this.FeatureToggleService.supports(this.FeatureToggleService.features.avrilVmMailboxEnable),
    ]).then(results => results[0] || results[1]);
  }

  public isFeatureEnabledAvrilOnly(): ng.IPromise<boolean> {
    return this.FeatureToggleService.supports(this.FeatureToggleService.features.avrilVmMailboxEnable);
  }

  public update(userId: string, voicemail: boolean, services: string[]): ng.IPromise<string[]> {

    const vm = new Voicemail({
      dtmfAccessId: undefined,
    });

    const user = new UserV1({
      uuid: undefined,
      firstName: undefined,
      lastName: undefined,
      userName: undefined,
      preferredLanguage: undefined,
      services: services,
      voicemail: vm,
    });

    if (voicemail) {
      return this.HuronUserService.getUserV2Numbers(userId).then((data) => {
        _.set(user, 'voicemail.dtmfAccessId', _.get(data[0], 'siteToSite'));
        return this.isFeatureEnabledAvrilOnly()
          .then((data: boolean) => {
            if (!data && !_.isUndefined(user.services) && !_.includes(services, VOICEMAIL)) {
              user.services.push(VOICEMAIL);
            }
            return this.isFeatureEnabledAvril().then((data: boolean) => {
              if (data && !_.isUndefined(user.services) && !_.includes(services, AVRIL)) {
                user.services.push(AVRIL);
              }
              return this.HuronUserService.updateUserV1(userId, user).then(() => {
                return user.services;
              });
            });
          });
      });
    } else {
      if (this.isEnabledForUser(services)) {
        _.pull(user.services, VOICEMAIL);
      }
      return this.isFeatureEnabledAvril().then(data => {
        if (data && _.includes(services, AVRIL)) {
          _.pull(user.services, AVRIL);
        }
        return this.HuronUserService.updateUserV1(userId, user).then(() => {
          return user.services;
        });
      });
    }
  }
}
