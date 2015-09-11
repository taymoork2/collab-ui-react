///**
// * Created by shailesi on 20/08/15.
// */
//
//"use strict";
//
//describe('Contact Center Config Service', function () {
//  var sunlightConfigService;
//
//  beforeEach(module('Sunlight'));
//
//  beforeEach(inject(function (_SunlightConfigService_) {
//    sunlightConfigService = _SunlightConfigService_;
//  }));
//
//  it('should get userInfo for a given user UID', function () {
//    var userInfo = sunlightConfigService.getUserInfo('abcd1234-ab12-cd34-de56-abcdef123456');
//    expect(userInfo.orgId).toBe('deba1221-ab12-cd34-de56-abcdef123456');
//  });
//
//  it('should update userInfo in sunlight config service', function () {
//    var userInfo = angular.copy(getJSONFixture('sunlight/json/sunlightTestUser.json'));
//    userInfo.alias = 'newAgent1';
//    var result = sunlightConfigService.updateUserInfo(userInfo);
//    expect(result.status).toBe('success');
//  });
//
//});
