import moduleName from './index';

describe('MessengerInteropService', () => {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      'Authinfo',
      'Config',
      'MessengerInteropService',
    );
  });

  it('hasAssignableMessageItems():', function () {
    // any non-zero list of services => true
    spyOn(this.Authinfo, 'getMessageServices').and.returnValue([1]);
    let result = this.MessengerInteropService.hasAssignableMessageItems();
    expect(this.Authinfo.getMessageServices).toHaveBeenCalledWith({ assignableOnly: true });
    expect(result).toBe(true);

    // if list is 0, return whatever value 'hasAssignableMessageOrgEntitlement()'
    this.Authinfo.getMessageServices.and.returnValue([]);
    spyOn(this.MessengerInteropService, 'hasAssignableMessageOrgEntitlement').and.returnValue(true);
    result = this.MessengerInteropService.hasAssignableMessageItems();
    expect(result).toBe(true);

    this.MessengerInteropService.hasAssignableMessageOrgEntitlement.and.returnValue(false);
    result = this.MessengerInteropService.hasAssignableMessageItems();
    expect(result).toBe(false);
  });

  it('hasAssignableMessageOrgEntitlement():', function () {
    spyOn(this.Authinfo, 'isEntitled');
    this.MessengerInteropService.hasAssignableMessageOrgEntitlement();
    expect(this.Authinfo.isEntitled).toHaveBeenCalledWith(this.Config.entitlements.messenger_interop);
  });

  it('hasMessengerLicense():', function () {
    spyOn(this.Authinfo, 'getMessageServices').and.returnValue([]);
    expect(this.MessengerInteropService.hasMessengerLicense()).toBe(false);

    this.Authinfo.getMessageServices.and.returnValue([{
      license: {
        offerName: 'MSGR',
      },
    }]);
    expect(this.MessengerInteropService.hasMessengerLicense()).toBe(true);
  });

  it('subscriptionIsMessengerOnly():', function () {
    const fakeSubscription = {
      licenses: [] as any,
    };
    // empty licenses list
    let result = this.MessengerInteropService.subscriptionIsMessengerOnly(fakeSubscription);
    expect(result).toBe(false);

    // at least 1 license with 'MSGR'
    fakeSubscription.licenses.push({
      offerName: 'MSGR',
    });
    result = this.MessengerInteropService.subscriptionIsMessengerOnly(fakeSubscription);
    expect(result).toBe(true);

    // multiple licenses of 'MSGR' isn't treated as invalid (though unlikely to occur in practice)
    fakeSubscription.licenses.push({
      offerName: 'MSGR',
    });
    result = this.MessengerInteropService.subscriptionIsMessengerOnly(fakeSubscription);
    expect(result).toBe(true);

    // at least 1 license that is 'MSGR', and at least 1 not
    fakeSubscription.licenses.push({
      offerName: 'foo',
    });
    result = this.MessengerInteropService.subscriptionIsMessengerOnly(fakeSubscription);
    expect(result).toBe(false);
  });
});
