'use strict';

describe('invite spec', function () {
  var urlparams = '?test=test&another=another';

  describe('invite page with user param', function () {

    it('should forward to squared app without page param', function () {
      navigation.navigateTo('#/invite');
      invite.expectWebClient();
    });
  });

  // verify /invitelauncher behavior and problem with sauce
  xdescribe('Invite Launcher Flow', function () {

    it('invitelauncher should forward to squared app', function () {
      navigation.navigateTo('#/invitelauncher');
      invite.expectSquaredProtocol();
    });

  });

  describe('App Launcher Flow', function () {

    it('applauncher route should forward to squared app', function () {
      navigation.navigateTo('#/applauncher');
      invite.expectWebClient();
    });

    it('applauncher page should forward to squared app', function () {
      navigation.navigateTo('applauncher.html');
      invite.expectWebClient();
    });

    it('applauncher route should forward to squared app with url paramters', function () {
      navigation.navigateTo('#/applauncher' + urlparams);
      invite.expectWebClient(urlparams);
    });

    it('applauncher page should forward to squared app with url parameters', function () {
      navigation.navigateTo('applauncher.html' + urlparams);
      invite.expectWebClient(urlparams);
    });

  });

  describe('App Download Page', function () {

    it('appdownload route should forward to webapp', function () {
      navigation.navigateTo('#/appdownload');
      invite.expectWebClient();
    });

    it('applauncher page should forward to squared app', function () {
      navigation.navigateTo('appdownload.html');
      invite.expectWebClient();
    });
  });
});
