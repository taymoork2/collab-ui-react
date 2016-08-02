'use strict';

describe('Directive: ucVoicemail', function () {
  var $compile, $rootScope, TelephonyInfoService;
  var telephonyInfoWithVoice = getJSONFixture('huron/json/telephonyInfo/voiceEnabled.json');

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _TelephonyInfoService_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    TelephonyInfoService = _TelephonyInfoService_;
    spyOn(TelephonyInfoService, 'getTelephonyInfo').and.returnValue(telephonyInfoWithVoice);
  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<uc-voicemail/>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("voicemail.form");
  });
});
