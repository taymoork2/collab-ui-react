import { HuronCustomerService, Link } from 'modules/huron/customer';
import { HuronUserService, UserV1, Voicemail } from 'modules/huron/users';

const VOICEMAIL = 'VOICEMAIL';
const AVRIL = 'AVRIL';
export const VOICEMAIL_CHANGE = 'VOICEMAIL_CHANGE';
export class HuronVoicemailService {
  private isAvrilCustomer: boolean = false;
  /* @ngInject */
  constructor(
    private HuronCustomerService: HuronCustomerService,
    private HuronUserService: HuronUserService,
    private FeatureToggleService,
  ) {}

  public isEnabledForCustomer(): ng.IPromise<boolean> {
    let isEnabled = false;
    return this.HuronCustomerService.getCustomer().then( customer => {
      _.forEach(_.get<Array<Link>>(customer, 'links'), link => {
        if (link.rel === _.lowerCase(VOICEMAIL)) {
          isEnabled = true;
        }
      });
      return isEnabled;
    });
  }

  public isEnabledForUser(services: Array<string>): boolean {
    return _.includes(services, VOICEMAIL);
  }

  public isFeatureEnabledForAvril(): ng.IPromise<boolean> {
    return this.FeatureToggleService.supports(this.FeatureToggleService.features.avrilVmEnable).then (data => {
      return data;
    });
  }

  public update(userId: string, voicemail: boolean, services: Array<string>): ng.IPromise<Array<string>> {

    let vm = new Voicemail({
      dtmfAccessId: undefined,
    });

    let user = new UserV1({
      uuid: undefined,
      firstName: undefined,
      lastName: undefined,
      userName: undefined,
      preferredLanguage: undefined,
      services: services,
      voicemail: vm,
    });

    if (voicemail) {
      if (user.services) {
        if (!this.isEnabledForUser(services)) {
          user.services.push(VOICEMAIL);
        }
      }
      return this.HuronUserService.getUserV2Numbers(userId).then((data) => {
        _.set(user, 'voicemail.dtmfAccessId', _.get(data[0], 'siteToSite'));
        return this.isFeatureEnabledForAvril().then(data => {
          if ( data && !_.includes(services, AVRIL)) {
            user.services.push(AVRIL);
          }
          return this.HuronUserService.updateUserV1(userId, user).then(() => {
            return user.services;
          });
        });
      });
    } else {
      if (this.isEnabledForUser(services)) {
        _.pull(user.services, VOICEMAIL);
      }
      if (this.isAvrilCustomer && _.includes(services, AVRIL)) {
        _.pull(user.services, AVRIL);
      }
      return this.isFeatureEnabledForAvril().then(data => {
        if ( data && _.includes(services, AVRIL)) {
          _.pull(user.services, AVRIL);
        }
        return this.HuronUserService.updateUserV1(userId, user).then(() => {
          return user.services;
        });
      });
    }
  }
}
