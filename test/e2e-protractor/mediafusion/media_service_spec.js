'use strict';

describe('Validate Media Service Managemnt Page', function () {

  describe('Listing Media Service Clusters on page load', function () {

    it('login as media super admin', function () {
      login.login('media-super-admin');
    }, 120000);

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
