import moduleName from './index';

describe('OnboardService:', () => {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      'OnboardService',
    );
  });

  beforeEach(function () {
    this.fakeEntitlements = {
      fake1: true,
      fake2: false,
      fake3: false,
    };
  });

  describe('getEntitlements():', () => {
    it('should add elements to results list only if entitlement is true:', function () {
      let result = this.OnboardService.getEntitlements('add', this.fakeEntitlements);
      expect(result.length).toBe(1);

      this.fakeEntitlements.fake2 = true;
      result = this.OnboardService.getEntitlements('add', this.fakeEntitlements);
      expect(result.length).toBe(2);

      this.fakeEntitlements.fake3 = true;
      result = this.OnboardService.getEntitlements('add', this.fakeEntitlements);
      expect(result.length).toBe(3);
    });

    it('should add elements with that have specific properties', function () {
      const result = this.OnboardService.getEntitlements('add', this.fakeEntitlements);
      expect(result[0].entitlementName).toBe('fake1');
      expect(result[0].entitlementState).toBe('ACTIVE');
      expect(result[0].properties).toEqual({});
    });
  });

  // TODO (f3745): relocate 'isEmailAlreadyPresent()' once 'users.add' UI state is decoupled from 'OnboardCtrl'
  describe('isEmailAlreadyPresent():', () => {
    it('should return true if a provided email exists in in a list provided by "getTokenEmailArray()" method', function () {
      spyOn(this.OnboardService, 'getTokenEmailArray').and.returnValue(['user1@example.com']);
      expect(this.OnboardService.isEmailAlreadyPresent('user1@example.com')).toBe(true);
      expect(this.OnboardService.isEmailAlreadyPresent('user2@example.com')).toBe(false);

      this.OnboardService.getTokenEmailArray.and.returnValue([]);
      expect(this.OnboardService.isEmailAlreadyPresent('user1@example.com')).toBe(false);
    });

    it('should return false if no email-like token is present', function () {
      expect(this.OnboardService.isEmailAlreadyPresent('foo')).toBe(false);
      expect(this.OnboardService.isEmailAlreadyPresent('')).toBe(false);
    });
  });

  describe('parseUsersList():', () => {
    it('should return a parsed list of user objects with "address" and "name" properties', function () {
      expect(this.OnboardService.parseUsersList('user1@example.com')).toEqual([{
        address: 'user1@example.com',
        name: '',
      }]);

      expect(this.OnboardService.parseUsersList('user1@example.com, user2@example.com')).toEqual([{
        address: 'user1@example.com',
        name: '',
      }, {
        address: 'user2@example.com',
        name: '',
      }]);

      expect(this.OnboardService.parseUsersList('john doe user1@example.com, jane doe user2@example.com')).toEqual([{
        address: 'user1@example.com',
        name: 'john doe',
      }, {
        address: 'user2@example.com',
        name: 'jane doe',
      }]);
    });
  });
});
