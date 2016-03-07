'use strict';

describe('ConfigService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var Service, win;
  var rootPath;

  beforeEach(function () {
    module(function ($provide) {
      win = {
        location: {
          search: ''
        },
        document: window.document
      };
      $provide.value('$window', win);
    });
  });

  beforeEach(inject(function ($injector, _ConfigService_, UrlConfig) {
    Service = _ConfigService_;
    rootPath = UrlConfig.getHerculesUrl();
  }));

  it('should return the correct url', function () {
    expect(Service.getUrl()).toBe(rootPath);
  });

  it('should return uss url', function () {
    expect(Service.getUSSUrl()).toBe('https://uss-integration.wbx2.com/uss/api/v1');
  });
});
