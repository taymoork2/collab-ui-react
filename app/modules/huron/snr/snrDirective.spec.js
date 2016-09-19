'use strict';

describe('Directive: ucSingleNumberReach', function () {
  var $q, $compile, $rootScope, TelephonyInfoService, DialPlanService;
  var telephonyInfoWithSnr = getJSONFixture('huron/json/telephonyInfo/snrEnabledWithDest.json');

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$q_, _$compile_, _$rootScope_, _TelephonyInfoService_, _DialPlanService_) {
    $q = _$q_;
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    TelephonyInfoService = _TelephonyInfoService_;
    DialPlanService = _DialPlanService_;

    spyOn(TelephonyInfoService, 'getTelephonyInfo').and.returnValue(telephonyInfoWithSnr);
    spyOn(DialPlanService, 'getCustomerVoice').and.returnValue($q.when({ regionCode: '' }));
  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<uc-single-number-reach/>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("snr.form");
  });
});
