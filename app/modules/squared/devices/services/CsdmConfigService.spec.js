'use strict';

describe('CsdmConfigService', function () {
  beforeEach(angular.mock.module('Squared'));

  var Service, rootPath;

  beforeEach(inject(function (_CsdmConfigService_, UrlConfig) {
    Service = _CsdmConfigService_;
    rootPath = UrlConfig.getCsdmServiceUrl();
  }));

  it('should return the correct url', function () {
    expect(Service.getUrl()).toBe(rootPath);
  });
});
