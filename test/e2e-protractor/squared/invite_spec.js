'use strict';

describe('invite spec', function () {
  var urlparams = '?test=test&another=another';
  // encrypted param from invitation email link for "Test User <phtest77+int1@gmail.com>"
  //var encryptedQueryParam = 'bnlA6k3ZerWIccYYY2RndVEeMjFu914UOsnFVyYNQoMrkJ7Hye+VFJ20BW2ghuv/7auSaumsYWmMkAlT+HIMqMKyK7AmUY3QhKY8fFXx34AQbKMkqy1ogx8uJUp1QL0E';
  var encryptedQueryParam = 'bnlA6k3ZerWIccYYY2RndVEeMjFu914UOsnFVyYNQoOtS2WBXdmPiQau5G/ErBDSiG5JxjtV9Dk6HIGGAAAkBQmkfHv5S9E8Ub+8rIeosI0QXZbR+/9ZN0m7BEtQIvRLfDFBFqh+L0B7vKsyzLGY/hy+SZ6sLAV22vzHZzWsIMg6OIP5gV/zkw8MLEFAyPNQHHkQQ5t7WB5QhUExd05+XQ==';

  afterEach(function () {
    utils.dumpConsoleErrors();
  });

  describe('invite page with user param', function () {

    it('should forward to squared app without page param', function () {
      browser.get('#/invite');
      invite.expectWebClient();
    });

    it('should forward to squared app with page param', function () {
      browser.get('#/invite?user=' + encodeURIComponent(encryptedQueryParam));
      invite.expectWebClient();
    });

  });

  // verify /invitelauncher behavior and problem with sauce
  xdescribe('Invite Launcher Flow', function () {

    it('invitelauncher should forward to squared app', function () {
      browser.get('#/invitelauncher');
      invite.expectSquaredProtocol();
    });

  });

  describe('App Launcher Flow', function () {

    it('applauncher route should forward to squared app', function () {
      browser.get('#/applauncher');
      invite.expectWebClient();
    });

    it('applauncher page should forward to squared app', function () {
      browser.get('applauncher.html');
      invite.expectWebClient();
    });

    it('applauncher route should forward to squared app with url paramters', function () {
      browser.get('#/applauncher' + urlparams);
      invite.expectWebClient(urlparams);
    });

    it('applauncher page should forward to squared app with url parameters', function () {
      browser.get('applauncher.html' + urlparams);
      invite.expectWebClient(urlparams);
    });

  });

  describe('App Download Page', function () {

    it('appdownload route should forward to webapp', function () {
      browser.get('#/appdownload');
      invite.expectWebClient();
    });

    it('applauncher page should forward to squared app', function () {
      browser.get('appdownload.html');
      invite.expectWebClient();
    });
  });
});
