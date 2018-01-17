'use strict';

describe('Service: GSSIframeService', function () {
  var GSSIframeService, $q, featureToggleService, urlConfig;

  beforeEach(angular.mock.module('GSS'));
  beforeEach(inject(dependencies));

  afterEach(function () {
    $q = GSSIframeService = undefined;
  });

  function dependencies(_$q_, _GSSIframeService_, _FeatureToggleService_, _UrlConfig_) {
    $q = _$q_;
    GSSIframeService = _GSSIframeService_;
    featureToggleService = _FeatureToggleService_;
    urlConfig = _UrlConfig_;
  }

  // it('getGssUrl, should return Webex CHP URL', function () {
  //   spyOn(featureToggleService, 'gssWebexCHPEnabledGetStatus').and.returnValue(true);
  //   spyOn(urlConfig, 'getGssUrlWebexCHP').and.returnValue('https://statusbts.webex.com/status');
  //   expect(GSSIframeService.getGssUrl()).toEqual('https://statusbts.webex.com/status');
  // });

  it('getGssUrl, should return AWS CHP URL', function () {
    spyOn(featureToggleService, 'gssWebexCHPEnabledGetStatus').and.returnValue($q.resolve(function () { return false; }));
    expect(GSSIframeService.getGssUrl()).toEqual('https://service-dev-collaborationhelp.cisco.com/status');
  });
});
