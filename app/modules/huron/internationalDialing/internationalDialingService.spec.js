'use strict';

describe('Service: InternationalDialing', function () {
  var $q, $rootScope;
  var Authinfo, FeatureToggleService, InternationalDialing;
  var cosRestrictions;

  beforeEach(module('Huron'));
  beforeEach(module('Sunlight'));

  beforeEach(inject(function (_$rootScope_, _$q_, _Authinfo_, _FeatureToggleService_, _InternationalDialing_) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    FeatureToggleService = _FeatureToggleService_;
    Authinfo = _Authinfo_;
    InternationalDialing = _InternationalDialing_;

    cosRestrictions = getJSONFixture('huron/json/telephonyInfo/userCosRestrictions.json');

    spyOn(Authinfo, 'getLicenseIsTrial').and.returnValue(true);
    spyOn(FeatureToggleService, 'supports');
  }));

  describe('isDisableInternationalDialing():', function () {
    it('should hide international dialing if customer is in trial', function () {
      FeatureToggleService.supports.and.returnValue($q.when(false));
      Authinfo.getLicenseIsTrial.and.returnValue(true);

      var isTrial = InternationalDialing.isDisableInternationalDialing();
      $rootScope.$apply();
      expect(FeatureToggleService.supports).toHaveBeenCalled();
      expect(Authinfo.getLicenseIsTrial).toHaveBeenCalled();
      expect(isTrial.$$state.value).toBe(true);
    });

    it('should show international dialing if customer is NOT in trial', function () {
      FeatureToggleService.supports.and.returnValue($q.when(false));
      Authinfo.getLicenseIsTrial.and.returnValue(false);

      var isTrial = InternationalDialing.isDisableInternationalDialing();
      $rootScope.$apply();
      expect(FeatureToggleService.supports).toHaveBeenCalled();
      expect(Authinfo.getLicenseIsTrial).toHaveBeenCalled();
      expect(isTrial.$$state.value).toBe(false);
    });

    it('should show international dialing if customer is in trial but has override', function () {
      FeatureToggleService.supports.and.returnValue($q.when(true));

      var isTrial = InternationalDialing.isDisableInternationalDialing();
      $rootScope.$apply();
      expect(FeatureToggleService.supports).toHaveBeenCalled();
      expect(Authinfo.getLicenseIsTrial).not.toHaveBeenCalled();
      expect(isTrial.$$state.value).toBe(false);
    });

    it('should hide international dialing if get override fails and unable to determine if customer is in trial', function () {
      FeatureToggleService.supports.and.returnValue($q.when(false));
      Authinfo.getLicenseIsTrial.and.returnValue(undefined);

      var isTrial = InternationalDialing.isDisableInternationalDialing();
      $rootScope.$apply();
      expect(FeatureToggleService.supports).toHaveBeenCalled();
      expect(Authinfo.getLicenseIsTrial).toHaveBeenCalled();
      expect(isTrial.$$state.value).toBe(true);
    });
  });

});
