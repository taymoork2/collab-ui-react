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

  beforeEach(inject(function ($injector, _ConfigService_, Config) {
    Service = _ConfigService_;
    rootPath = Config.getHerculesUrl();
  }));

  it('should return the correct url', function () {
    expect(Service.getUrl()).toBe(rootPath + 'v1');
  });

  it('should be possible to override url', function () {
    win.location.search = 'hercules-url=fake-url';
    expect(Service.getUrl()).toBe('fake-url');
  });

  it('should return a decoded overridden url', function () {
    win.location.search = 'hercules-url=this%20is%21an%2Bencoded%25url';
    expect(Service.getUrl()).toBe('this is!an+encoded%url');
  });

  it('should return uss url', function () {
    expect(Service.getUSSUrl()).toBe('https://uss-integration.wbx2.com/uss/api/v1');
  });

  it('should be possible to override USS url', function () {
    win.location.search = 'uss-url=fake-url';
    expect(Service.getUSSUrl()).toBe('fake-url');
  });
});
