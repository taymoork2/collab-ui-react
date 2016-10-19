'use strict';

describe('Validate Media Service Managemnt Page', function () {

  describe('Listing Media Service Clusters on page load', function () {

    it('login as media super admin', function () {
      login.login('media-super-admin');
      //login.loginThroughGui('mediafusion54@yahoo.com', 'Cisco$234', '#/users');
    }, 120000);

    //We are not currently running this because the pages are behind feature toggle and sometime feature toggle doesn't loads fast. We will enable them when we remove feature toggle.
    describe('Metrics page : ', function () {
      it('Navigate to metrics page', function () {
        browser.sleep(5000);
        mediaservice.clickMetrics();
      });
      it('Should have the correct Metrics card details displayed', function () {
        utils.expectIsDisplayed(mediaservice.total_calls);
        utils.expectIsDisplayed(element(by.cssContainingText('.metrics-header', 'Hosted On-Premises')));
        utils.expectIsDisplayed(element(by.cssContainingText('.metrics-header', 'Overflowed to Cloud')));
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
      it('check for Percentage Utilization graph card', function () {
        utils.expectIsDisplayed(mediaservice.utilizationCard);
        utils.expectIsDisplayed(mediaservice.utilizationTitle);
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
        utils.expectIsDisplayed(mediaservice.utilizationTitle);
      });
      it('check for Availability', function () {
        utils.expectIsDisplayed(mediaservice.availabilityCard);
        utils.expectIsDisplayed(mediaservice.availabilityOfCluster);
      });
    });

    describe('Resource page : ', function () {
      it('Navigate to Resource page', function () {
        browser.sleep(3000);
        navigation.clickServicesTab();
        browser.sleep(5000);
        mediaservice.resourceButton.isPresent().then(function (result) {
          console.log(result);
          if (result) {
            mediaservice.settingsButton.isPresent().then(function (result1) {
              console.log(result1);
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
        utils.expectIsDisplayed(mediaservice.emailNotificationsHeading);
        utils.expectIsDisplayed(mediaservice.deactivateServiceHeading);
        utils.expectIsDisplayed(mediaservice.deactivateButton);
        utils.expectIsEnabled(mediaservice.deactivateButton);
        utils.expectIsDisplayed(mediaservice.documentationAndSoftware);
        utils.click(mediaservice.resourceTab);
        utils.click(mediaservice.settingsTab);
        utils.expectIsDisplayed(mediaservice.emailNotificationsHeading);
        utils.expectIsDisplayed(mediaservice.deactivateServiceHeading);
        utils.expectIsDisplayed(mediaservice.deactivateButton);
        utils.expectIsEnabled(mediaservice.deactivateButton);
        utils.expectIsDisplayed(mediaservice.documentationAndSoftware);
      });
      it('Should notify success message, when adding a correct mail id', function () {
        utils.sendKeys(mediaservice.emailNotificationInput, 'sample@cisco.com');
        utils.sendKeys(mediaservice.emailNotificationInput, protractor.Key.ENTER);
        notifications.assertSuccess('The email subscriber list was successfully saved.');
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
      var selectedClusterStatus;
      //var selectedClusterNode;
      var selectedClusterReleaseChannel;
      beforeEach(function () {
        browser.sleep(3000);
        navigation.clickServicesTab();
        browser.sleep(3000);
        mediaservice.resourceButton.isPresent().then(function (isPresent) {
          if (isPresent) {
            mediaservice.clickResource();
            utils.click(mediaservice.clusterFirstTr);
            mediaservice.clusterFirstTd.getText().then(function (text) {
              console.log(text);
              selectedClusterName = text;
            });
            mediaservice.clusterSecondTd.getText().then(function (text1) {
              console.log(text1);
              selectedClusterStatus = text1;
            });
            mediaservice.nodesListFirst.getText().then(function (text3) {
              console.log(text3);
              //selectedClusterNode = text3;
            });
            element(by.css('div[ng-if="groupDetails.clusterDetail.upgradeSchedule"]')).element(by.xpath('following-sibling::div')).getText().then(function (text4) {
              console.log(text4);
              selectedClusterReleaseChannel = text4;
            });
          }
        });
      });
      it('Should have the correct Header and Status details displayed', function () {
        expect(mediaservice.sidePanelHeader.getText()).toEqual(selectedClusterName);
        expect(mediaservice.sidePanelStatus.getText()).toEqual(selectedClusterStatus);
      });
      it('Should have the correct Side Panel details displayed', function () {
        utils.expectIsDisplayed(mediaservice.upgradeScheduleTitle);
        utils.expectIsDisplayed(mediaservice.releaseChannelTitle);
        utils.expectIsDisplayed(mediaservice.softwareUpgradeTitle);
        utils.expectIsDisplayed(mediaservice.nodesTitle);
        utils.expectIsDisplayed(mediaservice.clusterSettingsTitle);
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
        expect(mediaservice.clusterSettingsLink.getText()).toEqual(selectedClusterName);
        utils.click(mediaservice.clusterSettingsLink);
        browser.sleep(3000);
        expect(mediaservice.clusterSettingsPageHeader.getText()).toEqual(selectedClusterName + " settings");
        utils.expectIsDisplayed(mediaservice.clusterUpgradeTitle);
        utils.expectIsDisplayed(mediaservice.clusterReleaseChannelTitle);
        expect(selectedClusterReleaseChannel).toEqual("Stable");
        utils.expectIsDisplayed(mediaservice.clusterDeleteClusterTitle);
        utils.click(mediaservice.deleteClusterButton);
        utils.expectIsDisplayed(mediaservice.deleteClusterModalHeader);
        utils.click(mediaservice.deleteClusterModalCancel);
      });
    });
    //Commenting the below codes to enable feature toggle for new media service page development.
    /*it('Clicking on Media Service Management tab should change the view', function () {
      navigation.clickMediaServiceManagement();
    });

    it('Check if Media Service is Activated', function () {
      mediaservice.checkForActivation();
    });

    it('Check if Media Clusters are populated', function () {
      mediaservice.checkClusterSize();
    });

    it('Should be able to view Cluster Details after clicking a Row ', function () {
      mediaservice.clickOnMediaService();
      utils.expectIsDisplayed(mediaservice.groupDetails);
    });

    it('Clicking on Alarms  should show the Alarm Details Page ', function () {
      mediaservice.alarmDetailsPage();
    });

    it('Clicking on Host  should show the Host Details Page ', function () {
      utils.click(mediaservice.hostDetails);
      utils.expectIsDisplayed(mediaservice.hostTitle);
      utils.click(mediaservice.closeSidePanel);
    });

    it('Clicking on Settings Tab should change the view', function () {
      navigation.clickMediaServiceSettingsTab();
      utils.expectIsDisplayed(mediaservice.emailnotification);
    });*/

  });

  describe('Logout', function () {
    it('Should log out', function () {
      navigation.logout();
    });

  });

});
