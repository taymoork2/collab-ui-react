'use strict';

describe('InvitelauncherCtrl', function () {

  var $controller, $window, $cookies, UrlConfig, WindowLocation;

  beforeEach(module('Squared'));

  beforeEach(inject(function (_$controller_, _$cookies_, _UrlConfig_) {
    $controller = _$controller_;
    $cookies = _$cookies_;
    UrlConfig = _UrlConfig_;
    WindowLocation = {
      set: sinon.stub()
    };
    sinon.stub($cookies, 'getObject').returns({
      orgId: '123'
    });
    sinon.stub(UrlConfig, 'getSquaredAppUrl').returns('a');
  }));

  it('should redirect to the app URL with the invite data', function () {
    $controller('InvitelauncherCtrl', {
      WindowLocation: WindowLocation
    });
    expect(UrlConfig.getSquaredAppUrl.called).toBe(true);
    expect(WindowLocation.set.calledWith(UrlConfig.getSquaredAppUrl() + 'invitee/?invdata={"orgId":"123"}')).toBe(true);
  });
});
