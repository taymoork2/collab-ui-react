'use strict';

/* global webExUserSettings */
/* global webEx */
/* global webExCommon */

webExCommon.testInfo.describeCount = 0;

while (1 >= webExCommon.testInfo.describeCount) {
  switch (webExCommon.testInfo.describeCount) {
  case 1:
    webExCommon.testInfo.testType = 'T30';
    webExCommon.testInfo.describeText = 'WebEx user settings tests for ' + webExCommon.testInfo.testType + ' site ' + webExCommon.t30Info.siteUrl;
    break;

  default:
    webExCommon.testInfo.testType = 'T31';
    webExCommon.testInfo.describeText = 'WebEx user settings tests for ' + webExCommon.testInfo.testType + ' site ' + webExCommon.t31Info.siteUrl;
  }

  xdescribe(webExCommon.testInfo.describeText, function () {
    var setup = false;

    if (webExCommon.testInfo.testType == "T31") {
      beforeAll(function () {
        var promise = webEx.setup(
          1,
          'wbx-t31RegressionTestAdmin',
          webExCommon.t31Info.testAdminUsername,
          webExCommon.t31Info.testAdminPassword,
          webExCommon.t31Info.siteUrl
        );

        promise.then(
          function success(ticket) {
            setup = (null !== ticket);
          },

          function error() {
            setup = false;
          }
        );
      }); // beforeAll()
    } else {
      beforeAll(function () {
        var promise = webEx.setup(
          1,
          'wbx-t30RegressionTestAdmin',
          webExCommon.t30Info.testAdminUsername,
          webExCommon.t30Info.testAdminPassword,
          webExCommon.t30Info.siteUrl
        );

        promise.then(
          function success(ticket) {
            setup = (null !== ticket);
          },

          function error() {
            setup = false;
          }
        );
      }); // beforeAll()
    }

    if (webExCommon.testInfo.testType == "T31") {
      it('should login as ' + webExCommon.t31Info.testAdminUsername + ' and navigate to Users page', function () {
        navigation.clickUsers();
      });

      it('should allow search and click on user ' + webExUserSettings.t31TestUser.username, function () {
        utils.searchAndClick(webExUserSettings.t31TestUser.username);
      });
    } else {
      it('should login as ' + webExCommon.t30Info.testAdminUsername + ' and navigate to Users page', function () {
        navigation.clickUsers();
      });

      it('should allow search and click on user ' + webExUserSettings.t30TestUser.username, function () {
        utils.searchAndClick(webExUserSettings.t30TestUser.username);
      });
    }

    it('should allow click on conferencing in panel 1', function () {
      utils.wait(users.conferencingService);
      expect(users.conferencingService.isPresent()).toBeTruthy();
      utils.click(users.conferencingService);
    });

    if (webExCommon.testInfo.testType == "T31") {
      it('should allow click on site name ' + webExCommon.testT31SiteElement + ' in panel 2', function () {
        if (setup) {
          utils.wait(webExCommon.testT31SiteElement);
          expect(webExCommon.testT31SiteElement.isPresent()).toBeTruthy();
          utils.click(webExCommon.testT31SiteElement);
          utils.wait(webExUserSettings.userSettingsPanel);
        }
      });
    } else {
      it('should allow click on site name ' + webExCommon.testT30SiteElement + ' in panel 2', function () {
        if (setup) {
          utils.wait(webExCommon.testT30SiteElement);
          expect(webExCommon.testT30SiteElement.isPresent()).toBeTruthy();
          utils.click(webExCommon.testT30SiteElement);
          utils.wait(webExUserSettings.userSettingsPanel);
        }
      });
    }

    it('should not display WebEx error page', function () {
      if (setup) {
        expect(webExUserSettings.errorPanel.isPresent()).toBeFalsy();
      }
    });

    it('should display WebEx user basic settigns page (panel 3)', function () {
      if (setup) {
        utils.wait(webExUserSettings.userSettingsPanel);
        expect(webExUserSettings.userSettingsPanel.isDisplayed()).toBeTruthy();
      }
    });

    it('should click on privileges link in panel 3', function () {
      utils.wait(webExUserSettings.userPrivilegesLink);
      utils.click(webExUserSettings.userPrivilegesLink);
    });

    it('should display WebEx user privileges page (panel 4)', function () {
      if (setup) {
        utils.wait(webExUserSettings.userPrivilegesPanel);
        expect(webExUserSettings.userPrivilegesPanel.isPresent()).toBeTruthy();
        expect(webExUserSettings.userPrivilegesPanel.isDisplayed()).toBeTruthy();
      }
    });

    it('should allow navigation back to the 3rd panel', function () {
      if (setup) {
        utils.clickLastBreadcrumb();
        utils.wait(webExUserSettings.userSettingsPanel);
      }
    });

    if (webExCommon.testInfo.testType == "T30") {
      it('should allow edit and save in panel 3', function () {
        if (setup) {
          utils.wait(webExUserSettings.mcAuoCheckbox);
          webExUserSettings.mcAuo.click();

          expect(element(by.id('saveBtn')).isPresent()).toBeTruthy();
          utils.click(element(by.id('saveBtn')));

          utils.wait(webExUserSettings.alertSuccess);
        }
      });
    }

    // it('should pause', function () {
    //   browser.pause();
    // });

    it('should log out', function () {
      navigation.logout();
    });
  });

  ++webExCommon.testInfo.describeCount;
}
