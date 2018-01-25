import { Config } from 'modules/core/config/config';

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
}
