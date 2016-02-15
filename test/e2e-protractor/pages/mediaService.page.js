'use strict';

var MediaServicePage = function () {

  this.mediaClusterList = element(by.css('.media-clusters-list'));
  this.mfCluster = element.all(by.binding('row.entity.groupName'));
  this.clickActivateBtn = element(by.css('[ng-click="med.enableMediaService(med.currentServiceId)"]'));
  this.emailnotification = element(by.binding('mediaFusion.settings.emailExample'));
  this.closeSidePanel = element(by.css('.panel-close'));
  this.groupDetails = element(by.binding('groupDetails.displayName'));
  this.alarmExists = element(by.css('alarmCtrl.alarm.alarm'));
  this.alarmDetails = element(by.binding('alarm.alarm.title'));
  this.closeSidePanel = element(by.css('.panel-close'));
  this.hostDetails = element(by.binding('ecp.hosts[0].host_name'));
  this.hostTitle = element(by.binding('hostDetails.connector.host.host_name'));

  this.checkClusterSize = function () {

    element.all(by.binding('row.entity')).then(function (clusters) {
      expect(clusters.length).toBeGreaterThan(0);

    });
  };

  this.alarmDetailsPage = function () {

    utils.wait(this.alarmExists, 5000).then(function () {

      utils.click(element(by.binding('alarm.alarm.title')));
      utils.expectIsDisplayed(mediaservice.alarmDetails);

    }, function () {

      mediaservice.clickOnMediaService();
    });

  };

  this.clickOnMediaService = function () {

    element.all(by.binding('row.entity')).get(0).click();

  };

  this.clickOnAlarmDetails = function () {

    element.all(by.binding('row.entity')).get(0).click();

  };

  this.checkForActivation = function () {

    utils.wait(this.clickActivateBtn, 10000).then(function () {

      utils.click(element(by.css('[ng-click="med.enableMediaService(med.currentServiceId)"]')));

    }, function () {

      utils.expectIsDisplayed(mediaservice.mediaClusterList);
      utils.expectIsDisplayed(mediaservice.mfCluster);
    });
  };

};

module.exports = MediaServicePage;
