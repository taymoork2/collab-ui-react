'use strict';

describe('Validate Media Service Managemnt Page', function() {

  describe('Listing Media Service Clusters on page load', function() {

    it('login as media super admin', function() {
      login.login('media-super-admin');
      //login.loginThroughGui('mediafusion54@yahoo.com', 'Cisco$234', '#/users');
    }, 120000);

    //We are not currently running this because the pages are behind feature toggle and sometime feature toggle doesn't loads fast. We will enable them when we remove feature toggle.
    xdescribe('Metrics page : ', function() {
      it('Navigate to metrics page', function() {
        browser.sleep(5000);
        mediaservice.clickMetrics();
      });
      it('check for total_calls', function() {
        utils.expectIsDisplayed(mediaservice.total_calls);
      });
      it('check for averageutilization', function() {
        utils.expectIsDisplayed(mediaservice.averageutilization);
      });
      it('check for clusteravailability', function() {
        utils.expectIsDisplayed(mediaservice.clusteravailability);
      });
      it('check for cluster filter enabled', function() {
        utils.expectIsEnabled(mediaservice.clusterFilter);
        utils.click(mediaservice.clusterFilter);
        utils.click(mediaservice.clusterFilter);
      });
      it('check for time filter enabled', function() {
        utils.expectIsEnabled(mediaservice.timeFilter);
      });

      it('check for Percentage Utilization', function() {
        utils.expectIsDisplayed(mediaservice.utilizationCard);
        utils.expectIsDisplayed(mediaservice.utilizationTitle);
      });

      it('check for Call volume', function() {
        utils.expectIsDisplayed(mediaservice.callVolumeCard);
        utils.expectIsDisplayed(mediaservice.callVolumes);

      });

      it('check for Availability', function() {
        utils.expectIsDisplayed(mediaservice.availabilityCard);
        utils.expectIsDisplayed(mediaservice.availabilityOfCluster);
      });

      it('select different time range', function() {
        browser.sleep(3000);
        utils.click(mediaservice.timeFilter);
        utils.click(mediaservice.timeFilter.all(by.css('li')).last());
        utils.expectIsDisplayed(mediaservice.total_calls);
        utils.expectIsDisplayed(mediaservice.averageutilization);
        utils.expectIsDisplayed(mediaservice.clusteravailability);
      });
      it('check for total_calls', function() {
        utils.expectIsDisplayed(mediaservice.total_calls);
      });
      it('check for averageutilization', function() {
        utils.expectIsDisplayed(mediaservice.averageutilization);
      });
      it('check for clusteravailability', function() {
        utils.expectIsDisplayed(mediaservice.clusteravailability);
      });
      it('check for cluster filter enabled', function() {
        utils.expectIsEnabled(mediaservice.clusterFilter);
        utils.click(mediaservice.clusterFilter);
        utils.click(mediaservice.clusterFilter);
      });
      it('check for time filter enabled', function() {
        utils.expectIsEnabled(mediaservice.timeFilter);
      });

      it('check for Percentage Utilization', function() {
        utils.expectIsDisplayed(mediaservice.utilizationCard);
        utils.expectIsDisplayed(mediaservice.utilizationTitle);
      });

      it('check for Call volume', function() {
        utils.expectIsDisplayed(mediaservice.callVolumeCard);
        utils.expectIsDisplayed(mediaservice.callVolumes);

      });

      it('check for Availability', function() {
        utils.expectIsDisplayed(mediaservice.availabilityCard);
        utils.expectIsDisplayed(mediaservice.availabilityOfCluster);
      });
    });

    xdescribe('Resource page : ', function() {
      it('Navigate to Resource page', function() {
        browser.sleep(3000);
        navigation.clickServicesTab();
        browser.sleep(5000);
        mediaservice.resourceButton.isPresent().then(function(result) {
          console.log(result);
          if (result) {
            mediaservice.settingsButton.isPresent().then(function(result1) {
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

    xdescribe('Settings page : ', function() {
      it('Navigate to Settings page ', function() {
        browser.sleep(3000);
        navigation.clickServicesTab();
        browser.sleep(5000);
        mediaservice.resourceButton.isPresent().then(function(result) {
          console.log(result);
          if (result) {
            mediaservice.settingsButton.isPresent().then(function(result1) {
              console.log(result1);
              if (result1) {
                mediaservice.clickSettings();
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
              }
            });
          }
        });
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

  describe('Logout', function() {
    it('Should log out', function() {
      navigation.logout();
    });

  });

});
