// TODO: change these back to ES6 'import' statements, once these can be converted over to typescript
const moduleName = require('./onboard.module');
const Feature = require('./feature.helper-class');

describe('MessengerInteropService', () => {
  beforeEach(function () {
    this.initModules('core.onboard');
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
});
