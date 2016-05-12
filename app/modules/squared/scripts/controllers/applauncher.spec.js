'use strict';

describe('ApplauncherCtrl', function () {

  var $controller, $location, $timeout, UrlConfig, Utils, WindowLocation;
  var urlparams = '?test=test&another=another';

  beforeEach(module('Squared'));

  beforeEach(inject(function (_$controller_, _$location_, _$timeout_, _UrlConfig_, _Utils_) {
    $controller = _$controller_;
    $location = _$location_;
    $timeout = _$timeout_;
    UrlConfig = _UrlConfig_;
    Utils = _Utils_;
    WindowLocation = {
      set: sinon.stub()
    };
    sinon.stub(UrlConfig, 'getAndroidStoreUrl').returns('a');
    sinon.stub(UrlConfig, 'getItunesStoreUrl').returns('b');
    sinon.stub(UrlConfig, 'getSquaredAppUrl').returns('c');
    sinon.stub(UrlConfig, 'getWebClientUrl').returns('d');
    sinon.stub($location, 'absUrl').returns('http://127.0.0.1:8080/#/applauncher' + urlparams);
  }));

  it('should redirect to the web client with extra params', function () {
    sinon.stub(Utils, 'isAndroid').returns(false);
    sinon.stub(Utils, 'isIPhone').returns(false);
    sinon.stub(Utils, 'isWeb').returns(true);
    initController();
    expect(UrlConfig.getWebClientUrl.called).toBe(true);
    expect(WindowLocation.set.calledWith(UrlConfig.getWebClientUrl() + urlparams)).toBe(true);
  });

  it('should redirect to the iPhone app and then to the iTunes Store on an iPhone', function () {
    sinon.stub(Utils, 'isAndroid').returns(false);
    sinon.stub(Utils, 'isIPhone').returns(true);
    sinon.stub(Utils, 'isWeb').returns(false);
    initController();
    expect(UrlConfig.getSquaredAppUrl.called).toBe(true);
    expect(WindowLocation.set.calledWith(UrlConfig.getSquaredAppUrl())).toBe(true);
    $timeout.flush();
    expect(UrlConfig.getItunesStoreUrl.called).toBe(true);
    expect(WindowLocation.set.calledWith(UrlConfig.getItunesStoreUrl())).toBe(true);
  });

  it('should redirect to the Play Store on an Android', function () {
    sinon.stub(Utils, 'isAndroid').returns(true);
    sinon.stub(Utils, 'isIPhone').returns(false);
    sinon.stub(Utils, 'isWeb').returns(false);
    initController();
    expect(UrlConfig.getAndroidStoreUrl.called).toBe(true);
    expect(WindowLocation.set.calledWith(UrlConfig.getAndroidStoreUrl())).toBe(true);
  });

  function initController() {
    $controller('ApplauncherCtrl', {
      WindowLocation: WindowLocation
    });
  }
});
