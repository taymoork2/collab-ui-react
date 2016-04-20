'use strict';

var testuser = 'fakegmuser+test@gmail.com';

var emailParams = '&forward=YWRtaW5UZXN0VXNlckB3eDIuZXhhbXBsZS5jb20&pwdResetSuccess=true';

describe('Downloads page', function () {

  describe('with email parameter and reset/admin email params', function () {
    it('should display email account', function () {
      navigation.navigateTo('#/downloads?email=' + encodeURIComponent(testuser) + emailParams);
      utils.expectText(download.account, testuser);
    });

    it('should display message only for non-mobile device', function () {
      utils.expectIsDisplayed(download.webTxt);
      utils.expectIsNotDisplayed(download.iosTxt);
      utils.expectIsNotDisplayed(download.androidTxt);
    });

    it('should not display logged in user, logout link, search field, and tabs', function () {
      navigation.expectAdminSettingsNotDisplayed();
    });
  });

  describe('with email parameter only', function () {
    it('should display email account', function () {
      navigation.navigateTo('#/downloads?email=' + encodeURIComponent(testuser));
      utils.expectText(download.account, testuser);
    });
  });
});
