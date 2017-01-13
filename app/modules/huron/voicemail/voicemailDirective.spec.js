'use strict';

describe('Directive: ucVoicemail', function () {
  beforeEach(function () {
    this.initModules('Huron', 'Sunlight');
    this.injectDependencies('TelephonyInfoService');
    this.telephonyInfoWithVoice = getJSONFixture('huron/json/telephonyInfo/voiceEnabled.json');
    spyOn(this.TelephonyInfoService, 'getTelephonyInfo').and.returnValue(this.telephonyInfoWithVoice);
    this.compileComponent('ucVoicemail');
  });

  it('replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain("voicemail.form");
  });
});
