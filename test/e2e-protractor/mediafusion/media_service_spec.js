'use strict';

describe('Validate Media Service Managemnt Page', function () {
  describe('Listing Media Service Clusters on page load', function () {
    it('login as media super admin', function () {
      login.login('media-fusion-admin');
    }, 120000);

    // TODO: remove all sleeps before re-enabling. Use util methods.
    xdescribe('Mediaservice page : ', function () {
      it('Navigate to Mediaservice page', function () {
        browser.sleep(5000);
        mediaservice.clickMetrics();
      });
      it('Should have the correct Mediaservice card details displayed', function () {
        utils.expectIsDisplayed(element(by.cssContainingText('.metrics-header', 'Overflow to Cloud')));
        utils.expectIsDisplayed(element(by.cssContainingText('.metrics-header', 'Clusters in Service')));
        utils.expectIsDisplayed(element(by.cssContainingText('.metrics-header', 'Total Calls')));
      });
      it('check for cluster filter enabled', function () {
        utils.expectIsEnabled(mediaservice.clusterFilter);
        utils.click(mediaservice.clusterFilter);
        utils.click(mediaservice.clusterFilter);
      });
      it('check for time filter enabled', function () {
        utils.expectIsEnabled(mediaservice.timeFilter);
        utils.click(mediaservice.timeFilter);
        utils.expectIsDisplayed('Last 4 Hours');
        utils.expectIsDisplayed('Last 24 Hours');
        utils.expectIsDisplayed('Last Week');
        utils.expectIsDisplayed('Last Month');
        utils.expectIsDisplayed('Last 3 Months');
      });
      it('check for Percentage Utilization graph card', function () {
        utils.expectIsDisplayed(mediaservice.utilizationCard);
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
      });
      it('check for Availability', function () {
        utils.expectIsDisplayed(mediaservice.availabilityCard);
        utils.expectIsDisplayed(mediaservice.availabilityOfCluster);
      });
    });

    // TODO: remove all sleeps before re-enabling. Use util methods.
    xdescribe('Adoption page : ', function () {
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
      });
      it('Should have the adoption graph details displayed', function () {
        utils.expectIsDisplayed(mediaservice.clientTypeCardDiv);
        utils.expectIsDisplayed(mediaservice.meetLocationCardDiv);
        utils.expectIsDisplayed(mediaservice.totMeetsByHostHeader);
        utils.expectIsDisplayed(mediaservice.clientTypeHeader);
      });
    });

    // TODO: remove all sleeps before re-enabling. Use util methods.
    xdescribe('Resource page : ', function () {
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
        navigation.clickServicesTab();
        utils.click(mediaservice.settingsButton);
        navigation.expectCurrentUrl('/mediaserviceV2/settings');
      });
      it('Should have the correct settings details displayed', function () {
        utils.expectIsDisplayed(mediaservice.generalTitle);
        utils.expectIsDisplayed(mediaservice.deactivateServiceHeading);
        utils.expectIsDisplayed(mediaservice.deactivateButton);
        utils.expectIsEnabled(mediaservice.deactivateButton);
        utils.expectIsDisplayed(mediaservice.documentationAndSoftware);
      });
      it('Should notify success message, when adding a correct mail id', function () {
        utils.sendKeys(mediaservice.emailNotificationInput, 'sample@cisco.com');
        utils.sendKeys(mediaservice.emailNotificationInput, protractor.Key.ENTER);
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
      beforeEach(function (done) {
        navigation.clickServicesTab();
        utils.click(mediaservice.resourceButton);
        utils.click(mediaservice.clusterFirstTr);
        utils.waitIsDisplayed(mediaservice.clusterFirstTd);
        mediaservice.clusterFirstTd.getText().then(function (text) {
          selectedClusterName = text;
          done();
        });
      });
      it('Should have the correct Header and Status details displayed', function () {
        expect(mediaservice.sidePanelHeader.getText()).toEqual(selectedClusterName);
      });
      it('Should have the correct Side Panel details displayed', function () {
        utils.expectIsDisplayed(mediaservice.upgradeScheduleTitle);
        utils.expectIsDisplayed(mediaservice.releaseChannelTitle);
        utils.expectIsDisplayed(mediaservice.nodesTitle);
      });
      it('Should be able to open Move Node modal', function () {
        utils.click(mediaservice.nodesListFirst);
        utils.click(mediaservice.performActionsOnNodeBtn);
        utils.click(mediaservice.actionsBtn);
        utils.click(mediaservice.moveNodeLink);
        utils.expectIsDisplayed(mediaservice.moveNodeModalHeader);
        utils.click(mediaservice.moveNodeModalCancelButton);
      });
      it('Should be able to open Deregister Node modal', function () {
        utils.click(mediaservice.nodesListFirst);
        utils.click(mediaservice.performActionsOnNodeBtn);
        utils.click(mediaservice.actionsBtn);
        utils.click(mediaservice.deregisterMoveNodeLink);
        utils.expectIsDisplayed(mediaservice.deregisterMoveNodeHeader);
        browser.refresh();
      });
      it('Should navigate to respective settings, when Cluster Settings is clicked', function () {
        utils.click(mediaservice.clusterSettingsLink);

        //expect(mediaservice.clusterSettingsPageHeader.getText()).toEqual(selectedClusterName + ' settings');
        utils.expectIsDisplayed(mediaservice.clusterUpgradeTitle);
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
