'use strict';

describe('AppdownloadCtrl', function () {

  var $controller, UrlConfig, Utils, WindowLocation;

  beforeEach(module('Squared'));

  beforeEach(inject(function (_$controller_, _UrlConfig_, _Utils_) {
    $controller = _$controller_;
    UrlConfig = _UrlConfig_;
    Utils = _Utils_;
    WindowLocation = {
      set: sinon.stub()
    };
    sinon.stub(UrlConfig, 'getAndroidStoreUrl').returns('a');
    sinon.stub(UrlConfig, 'getItunesStoreUrl').returns('b');
    sinon.stub(UrlConfig, 'getWebClientUrl').returns('c');
  }));

  it('should redirect to the iTunes Store on an iPhone', function () {
    sinon.stub(Utils, 'isAndroid').returns(false);
    sinon.stub(Utils, 'isIPhone').returns(true);
    initController();
    expect(UrlConfig.getItunesStoreUrl.called).toBe(true);
    expect(WindowLocation.set.calledWith(UrlConfig.getItunesStoreUrl())).toBe(true);
  });

  it('should redirect to the Play Store on an Android', function () {
    sinon.stub(Utils, 'isAndroid').returns(true);
    sinon.stub(Utils, 'isIPhone').returns(false);
    initController();
    expect(UrlConfig.getAndroidStoreUrl.called).toBe(true);
    expect(WindowLocation.set.calledWith(UrlConfig.getAndroidStoreUrl())).toBe(true);
  });

  it('should redirect to the the web client otherwise', function () {
    sinon.stub(Utils, 'isAndroid').returns(false);
    sinon.stub(Utils, 'isIPhone').returns(false);
    initController();
    expect(UrlConfig.getWebClientUrl.called).toBe(true);
    expect(WindowLocation.set.calledWith(UrlConfig.getWebClientUrl())).toBe(true);
  });

  function initController() {
    $controller('AppdownloadCtrl', {
      WindowLocation: WindowLocation
    });
  }
});
