'use strict';

describe('Directive: ucSingleNumberReach', function () {
  beforeEach(function () {
    this.initModules('Huron');
    this.injectDependencies('$q', 'TelephonyInfoService', 'DialPlanService');
    this.telephonyInfoWithSnr = getJSONFixture('huron/json/telephonyInfo/snrEnabledWithDest.json');
    spyOn(this.TelephonyInfoService, 'getTelephonyInfo').and.returnValue(this.telephonyInfoWithSnr);
    spyOn(this.DialPlanService, 'getCustomerVoice').and.returnValue(this.$q.resolve({ regionCode: '' }));
    spyOn(this.TelephonyInfoService, 'getRemoteDestinationInfo').and.returnValue(this.$q.resolve(this.telephonyInfoWithSnr));
    this.compileComponent('ucSingleNumberReach');
  });

  it('replaces the element with the appropriate content', function () {
    expect(this.view.html()).toContain("snr.form");
  });
});
