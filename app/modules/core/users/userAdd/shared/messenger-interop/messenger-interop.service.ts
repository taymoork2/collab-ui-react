import { Config } from 'modules/core/config/config';
import { ISubscription, ILicenseUsage } from 'modules/core/users/userAdd/assignable-services/shared/license-usage-util.interfaces';

export default class MessengerInteropService {
  /* @ngInject */
  constructor(
    private Authinfo,
    private Config: Config,
  ) {}

  public hasAssignableMessageItems(): boolean {
    const messageFeatures = this.Authinfo.getMessageServices({ assignableOnly: true });
    if (_.size(messageFeatures)) {
      return true;
    }

    return this.hasAssignableMessageOrgEntitlement();
  }

  public hasAssignableMessageOrgEntitlement(): boolean {
    return this.Authinfo.isEntitled(this.Config.entitlements.messenger_interop);
  }

  public hasMessengerLicense(): boolean {
    const messageServices = this.Authinfo.getMessageServices();
    const hasMessenger = _.find(messageServices, {
      license: {
        offerName: this.Config.offerCodes.MSGR,
      },
    });
    return !!hasMessenger;
  }

  public subscriptionIsMessengerOnly(subscription: ISubscription): boolean {
    if (_.isEmpty(subscription.licenses)) {
      return false;
    }
    const msgrLicenses: ILicenseUsage[] = _.filter(subscription.licenses, { offerName: this.Config.offerCodes.MSGR });
    const nonMsgrLicenses: ILicenseUsage[] = _.reject(subscription.licenses, { offerName: this.Config.offerCodes.MSGR });
    return _.isEmpty(nonMsgrLicenses) && !_.isEmpty(msgrLicenses);
  }
}
