'use strict';

describe('MediaConfigService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var Service;
  var rootPath;

  beforeEach(inject(function (_MediaConfigService_, UrlConfig) {
    Service = _MediaConfigService_;
    rootPath = UrlConfig.getHerculesUrl();
  }));

  it('should return the correct url', function () {
    expect(Service.getUrl()).toBe(rootPath);
  });

  it('should return uss url', function () {
    expect(Service.getUSSUrl()).toBe('https://uss-integration.wbx2.com/uss/api/v1');
  });

  it('should return calliope url', function () {
    expect(Service.getCalliopeUrl()).toBe('https://calliope-integration.wbx2.com/calliope/api/authorization/v1');
  });

});
