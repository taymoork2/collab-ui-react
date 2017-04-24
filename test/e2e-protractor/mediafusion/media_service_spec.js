'use strict';

describe('Validate Media Service Managemnt Page', function () {

  describe('Listing Media Service Clusters on page load', function () {

    it('login as media super admin', function () {
      //login.login('media-super-admin');
      //login.loginThroughGui('mediafusion54@yahoo.com', 'Cisco$234', '#/users');
      var username = 'mediafusion54@yahoo.com';
      var password = 'Cisco$234';
      navigation.navigateTo('#/login');
      utils.sendKeys(element(by.css('[name="email"]')), username);
      utils.click(element(by.css('button[ng-click="login()"]')));
      browser.driver.wait(browser.driver.isElementPresent(by.id('IDToken2')));
      browser.driver.findElement(by.id('IDToken2')).sendKeys(password);
      browser.driver.findElement(by.id('Button1')).click();
    }, 120000);

    //We are not currently running this because the pages are behind feature toggle and sometime feature toggle doesn't loads fast. We will enable them when we remove feature toggle.
    describe('Mediaservice page : ', function () {
      it('Navigate to Mediaservice page', function () {
        browser.sleep(5000);
        mediaservice.clickMetrics();
      });
      it('Should have the correct Mediaservice card details displayed', function () {
        //utils.expectIsDisplayed(mediaservice.total_calls);
        utils.expectIsDisplayed(element(by.cssContainingText('.metrics-header', 'Overflow to Cloud')));
        utils.expectIsDisplayed(element(by.cssContainingText('.metrics-header', 'Clusters in Service')));
      });
      it('check for cluster filter enabled', function () {
        utils.expectIsEnabled(mediaservice.clusterFilter);
        utils.click(mediaservice.clusterFilter);
        utils.click(mediaservice.clusterFilter);
      });
      it('check for time filter enabled', function () {
        utils.expectIsEnabled(mediaservice.timeFilter);
      });
      it('check for Percentage Utilization graph card', function () {
        utils.expectIsDisplayed(mediaservice.utilizationCard);
        //utils.expectIsDisplayed(mediaservice.utilizationTitle);
      });
      it('check for Availability graph card', function () {
        utils.expectIsDisplayed(mediaservice.availabilityCard);
        utils.expectIsDisplayed(mediaservice.availabilityOfCluster);
      });
      it('check for different time range', function () {
        browser.sleep(3000);
        utils.click(mediaservice.timeFilter);
        utils.click(mediaservice.timeFilter.all(by.css('li')).last());
        utils.expectIsDisplayed(mediaservice.clusteravailability);
      });
      it('Flipping the Total Meetings card should have the correct description displayed', function () {
        utils.click(mediaservice.totalmeetsFlip);
        expect(mediaservice.totalmeetsFlipDiv.getText()).toEqual(mediaservice.totalmeetsFlipDesc);
      });
      it('check for clusteravailability', function () {
        utils.expectIsDisplayed(mediaservice.clusteravailability);
      });
      it('check for cluster filter enabled', function () {
        utils.expectIsEnabled(mediaservice.clusterFilter);
        utils.click(mediaservice.clusterFilter);
        utils.click(mediaservice.clusterFilter);
      });
      it('check for time filter enabled', function () {
        utils.expectIsEnabled(mediaservice.timeFilter);
      });
      it('check for Percentage Utilization', function () {
        utils.expectIsDisplayed(mediaservice.utilizationCard);
        //utils.expectIsDisplayed(mediaservice.utilizationTitle);
      });
      it('check for Availability', function () {
        utils.expectIsDisplayed(mediaservice.availabilityCard);
        utils.expectIsDisplayed(mediaservice.availabilityOfCluster);
      });
    });

    describe('Adoption page : ', function () {
      it('Navigate to adoption page', function () {
        browser.sleep(5000);
        mediaservice.clickMetrics();
        mediaservice.clickAdoption();
      });
      it('Should have the correct Adoption card details displayed', function () {
        utils.expectIsDisplayed(mediaservice.totallMeetsHeader);
        utils.expectIsDisplayed(mediaservice.meetingHostTypeHeader);
        utils.expectIsDisplayed(mediaservice.clientTypesHeader);
      });
      it('Should have different time range values', function () {
        browser.sleep(3000);
        utils.click(mediaservice.timeFilter);
        utils.click(mediaservice.timeFilter.all(by.css('li')).last());
        utils.expectIsDisplayed(mediaservice.totallMeetsHeader);
      });
      it('Flipping the Meeting Host type should have the correct description displayed', function () {
        utils.click(mediaservice.meetHostFlip);
        expect(mediaservice.meetHostFlipDiv.getText()).toEqual(mediaservice.meetHostFlipDesc);
      });
      it('Should have the adoption graph details displayed', function () {
        utils.expectIsDisplayed(mediaservice.clientTypeCardDiv);
        utils.expectIsDisplayed(mediaservice.meetLocationCardDiv);
        utils.expectIsDisplayed(mediaservice.totMeetsByHostHeader);
        utils.expectIsDisplayed(mediaservice.clientTypeHeader);
      });
    });

    describe('Resource page : ', function () {
      it('Navigate to Resource page', function () {
        browser.sleep(3000);
        navigation.clickServicesTab();
        browser.sleep(5000);
        mediaservice.resourceButton.isPresent().then(function (result) {
          if (result) {
            mediaservice.settingsButton.isPresent().then(function (result1) {
              if (result1) {
                mediaservice.clickResource();
                utils.expectIsDisplayed(mediaservice.resourceTab);
                utils.expectIsDisplayed(mediaservice.settingsTab);
                utils.click(mediaservice.settingsTab);
                utils.click(mediaservice.resourceTab);
                utils.expectIsDisplayed(mediaservice.addResourceButton);
                utils.expectIsEnabled(mediaservice.addResourceButton);
                utils.expectIsDisplayed(mediaservice.mediaCluster);
                utils.expectIsDisplayed(mediaservice.serviceStatus);
              }
            });
          }
        });
      });
    });

    describe('Settings page : ', function () {
      beforeEach(function () {
        browser.sleep(3000);
        navigation.clickServicesTab();
        browser.sleep(3000);
        mediaservice.resourceButton.isPresent().then(function (result) {
          if (result) {
            mediaservice.settingsButton.isPresent().then(function (result1) {
              if (result1) {
                mediaservice.clickSettings();
              }
            });
          }
        });
      });
      it('Should have the correct settings details displayed', function () {
        //utils.expectIsDisplayed(mediaservice.emailNotificationsHeading);
        utils.expectIsDisplayed(mediaservice.videoQualityHeading);
        utils.expectIsDisplayed(mediaservice.deactivateServiceHeading);
        utils.expectIsDisplayed(mediaservice.deactivateButton);
        utils.expectIsEnabled(mediaservice.deactivateButton);
        utils.expectIsDisplayed(mediaservice.documentationAndSoftware);
      });
      it('Should notify success message, when adding a correct mail id', function () {
        utils.sendKeys(mediaservice.emailNotificationInput, 'sample@cisco.com');
        utils.sendKeys(mediaservice.emailNotificationInput, protractor.Key.ENTER);
        //notifications.assertSuccess('The email subscriber list was successfully saved.');
      });
      it('Should highlight the entered input, when adding an incorrect mail id', function () {
        utils.sendKeys(mediaservice.emailNotificationInput, 'sample');
        utils.sendKeys(mediaservice.emailNotificationInput, protractor.Key.ENTER);
        expect(mediaservice.invalidEmailTag.isPresent()).toBe(true);
      });
      it('Should open Deactivate Service modal, when Deactivate button is clicked', function () {
        utils.click(mediaservice.deactivateButton);
        utils.expectIsDisplayed(mediaservice.deactivateServiceModalHeader);
        utils.click(mediaservice.deactivateServiceModalCancelButton);
      });
    });

    describe('Side Panel : ', function () {
      var selectedClusterName;
      //var selectedClusterStatus;
      beforeEach(function () {
        browser.sleep(3000);
        navigation.clickServicesTab();
        browser.sleep(3000);
        mediaservice.resourceButton.isPresent().then(function (isPresent) {
          if (isPresent) {
            mediaservice.clickResource();
            utils.click(mediaservice.clusterFirstTr);
            mediaservice.clusterFirstTd.getText().then(function (text) {
              selectedClusterName = text;
            });
            // mediaservice.clusterSecondTd.getText().then(function (text1) {
            //   selectedClusterStatus = text1;
            // });
          }
        });
      });
      it('Should have the correct Header and Status details displayed', function () {
        expect(mediaservice.sidePanelHeader.getText()).toEqual(selectedClusterName);
        //expect(mediaservice.sidePanelStatus.getText()).toEqual(selectedClusterStatus);
      });
      it('Should have the correct Side Panel details displayed', function () {
        utils.expectIsDisplayed(mediaservice.upgradeScheduleTitle);
        utils.expectIsDisplayed(mediaservice.releaseChannelTitle);
        utils.expectIsDisplayed(mediaservice.nodesTitle);
      });
      it('Should be able to open Move Node modal', function () {
        utils.click(mediaservice.nodesListFirst);
        utils.click(mediaservice.moveNodeLink);
        utils.expectIsDisplayed(mediaservice.moveNodeModalHeader);
        utils.click(mediaservice.moveNodeModalCancelButton);
      });
      it('Should be able to open Deregister Node modal', function () {
        utils.click(mediaservice.nodesListFirst);
        utils.click(mediaservice.deregisterMoveNodeLink);
        utils.expectIsDisplayed(mediaservice.deregisterMoveNodeHeader);
        utils.click(mediaservice.deregisterMoveNodeCancelButton);
      });
      it('Should navigate to respective settings, when Cluster Settings is clicked', function () {
        utils.click(mediaservice.clusterSettingsLink);
        browser.sleep(3000);
        expect(mediaservice.clusterSettingsPageHeader.getText()).toEqual(selectedClusterName + " settings");
        utils.expectIsDisplayed(mediaservice.clusterUpgradeTitle);
        utils.expectIsDisplayed(mediaservice.unifiedCMSIPTrunkTitle);
        utils.expectIsDisplayed(mediaservice.clusterReleaseChannelTitle);
        utils.expectIsDisplayed(mediaservice.clusterDeleteClusterTitle);
        utils.click(mediaservice.deleteClusterButton);
        utils.expectIsDisplayed(mediaservice.deleteClusterModalHeader);
        utils.click(mediaservice.deleteClusterModalCancel);
      });
    });
  });

  describe('Logout', function () {
    it('Should log out', function () {
      navigation.logout();
    });

  });

});
