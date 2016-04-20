'use strict';

describe('CsdmConfigService', function () {
  beforeEach(module('Squared'));

  var Service, rootPath;

  beforeEach(inject(function ($injector, _CsdmConfigService_, UrlConfig) {
    Service = _CsdmConfigService_;
    rootPath = UrlConfig.getCsdmServiceUrl();
  }));

  it('should return the correct url', function () {
    expect(Service.getUrl()).toBe(rootPath);
  });
});
