'use strict';

var testuser = 'fakegmuser+test@gmail.com';

var emailParams = '&forward=YWRtaW5UZXN0VXNlckB3eDIuZXhhbXBsZS5jb20&pwdResetSuccess=true';

describe('Downloads page', function () {
  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  afterEach(function () {
    browser.ignoreSynchronization = false;
  });

  describe('with email parameter and reset/admin email params', function () {
    it('should display email account', function () {
      browser.get('#/downloads?email=' + encodeURIComponent(testuser) + emailParams);
      expect(download.account.getText()).toContain(testuser);
    });

    it('should display message only for non-mobile device', function () {
      utils.expectIsDisplayed(element(by.id('webTxt')));
      utils.expectIsNotDisplayed(element(by.id('iosTxt')));
      utils.expectIsNotDisplayed(element(by.id('androidTxt')));
    });

    it('should not display logged in user, logout link, search field, and tabs', function () {
      navigation.expectAdminSettingsNotDisplayed();
    });
  });

  describe('with email parameter only', function () {
    it('should display email account', function () {
      browser.get('#/downloads?email=' + encodeURIComponent(testuser));
      expect(download.account.getText()).toContain(testuser);
    });
  });
});
