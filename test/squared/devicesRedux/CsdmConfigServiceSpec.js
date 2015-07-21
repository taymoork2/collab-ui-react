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
        },
        document: window.document
      };
      $provide.value('$window', win);
    });
  });

  beforeEach(inject(function ($injector, _CsdmConfigService_, Config) {
    Service = _CsdmConfigService_;
    rootPath = Config.getCsdmServiceUrl();
  }));

  it('should return the correct url', function () {
    expect(Service.getUrl()).toBe(rootPath);
  });

  it('should be possible to override url', function () {
    win.location.search = 'csdm-url=fake-url';
    expect(Service.getUrl()).toBe('fake-url');
  });

  it('should return a decoded overridden url', function () {
    win.location.search = 'csdm-url=this%20is%21an%2Bencoded%25url';
    expect(Service.getUrl()).toBe('this is!an+encoded%url');
  });
});
