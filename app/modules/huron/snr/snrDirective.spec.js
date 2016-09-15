'use strict';

describe('Directive: ucSingleNumberReach', function () {
  var $compile, $rootScope, TelephonyInfoService;
  var telephonyInfoWithSnr = getJSONFixture('huron/json/telephonyInfo/snrEnabledWithDest.json');

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _TelephonyInfoService_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    TelephonyInfoService = _TelephonyInfoService_;
    spyOn(TelephonyInfoService, 'getTelephonyInfo').and.returnValue(telephonyInfoWithSnr);
  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<uc-single-number-reach/>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("snr.form");
  });
});
