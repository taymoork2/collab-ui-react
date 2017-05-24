'use strict';

var moduleName = require('./onboard.module');

describe('OnboardService:', function () {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      'OnboardService'
    );
  });

  beforeEach(function () {
    this.fakeEntitlements = {
      fake1: true,
      fake2: false,
      fake3: false,
    };
  });

  describe('getEntitlements():', function () {
    it('should add elements to results list only if entitlement is true:', function () {
      var result = this.OnboardService.getEntitlements('add', this.fakeEntitlements);
      expect(result.length).toBe(1);

      this.fakeEntitlements.fake2 = true;
      result = this.OnboardService.getEntitlements('add', this.fakeEntitlements);
      expect(result.length).toBe(2);

      this.fakeEntitlements.fake3 = true;
      result = this.OnboardService.getEntitlements('add', this.fakeEntitlements);
      expect(result.length).toBe(3);
    });

    it('should add elements with that have specific properties', function () {
      var result = this.OnboardService.getEntitlements('add', this.fakeEntitlements);
      expect(result[0].entitlementName).toBe('fake1');
      expect(result[0].entitlementState).toBe('ACTIVE');
      expect(result[0].properties).toEqual({});
    });
  });
});
