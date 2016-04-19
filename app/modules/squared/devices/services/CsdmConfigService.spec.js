'use strict';

describe('CsdmConfigService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var Service, win;
  var rootPath;

  beforeEach(function () {
    module(function ($provide) {
      win = {
        location: {
          search: ''
        }
      };
      $provide.value('$window', win);
    });
  });

  beforeEach(inject(function ($injector, _CsdmConfigService_, UrlConfig) {
    Service = _CsdmConfigService_;
    rootPath = UrlConfig.getCsdmServiceUrl();
  }));

  it('should return the correct url', function () {
    expect(Service.getUrl()).toBe(rootPath);
  });
});
