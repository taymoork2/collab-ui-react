import { Config } from 'modules/core/config/config';

export default class MessengerInteropService {
  /* @ngInject */
  constructor(
    private Authinfo,
    private Config: Config,
  ) {}

  public hasAssignableMessageItems() {
    const messageFeatures = this.Authinfo.getMessageServices({ assignableOnly: true });
    if (_.size(messageFeatures)) {
      return true;
    }

    return this.hasAssignableMessageOrgEntitlement();
  }

  public hasAssignableMessageOrgEntitlement() {
    return this.Authinfo.isEntitled(this.Config.entitlements.messenger_interop);
  }
}
