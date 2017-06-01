export default class MessengerInteropService {

  /* @ngInject */
  constructor(
    private Authinfo,
    private Config,
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
