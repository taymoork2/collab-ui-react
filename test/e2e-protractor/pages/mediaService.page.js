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
  this.metricsTab = element(by.css('a[href="#/reports/metrics"]'));
  this.total_calls = element(by.cssContainingText('.metrics-header', 'Total Calls'));
  this.averageutilization = element(by.cssContainingText('.metrics-header', 'Average Utilization'));
  this.clusteravailability = element(by.cssContainingText('.metrics-header', 'Cluster Availability'));
  this.timeFilter = element(by.css('#timeFilter'));
  this.clusterFilter = element(by.css('#clusterFilter'));
  this.internalNumberOptionFirst = element(by.css('.ng-pristine[name="timeFilter"]')).all(by.repeater('option in csSelect.options')).last().element(by.tagName('a'));
  this.utilizationCard = element(by.css('#utilization-card'));
  this.callVolumeCard = element(by.css('#call-volume-card'));
  this.availabilityCard = element(by.css('#availability-card'));
  this.utilizationTitle = element(by.cssContainingText('.report-section-header', 'Percentage Utilization'));
  this.callVolumes = element(by.cssContainingText('.report-section-header', 'Total Calls'));
  this.availabilityOfCluster = element(by.cssContainingText('.report-section-header', 'Cluster Availability'));
  this.resourceButton = element(by.css('section a[href="#/mediaserviceV2"]'));
  this.settingsButton = element(by.css('section a[href="#/mediaserviceV2/settings"]'));
  this.resourceTab = element(by.css('li a[href="#/mediaserviceV2"]'));
  this.settingsTab = element(by.css('li a[href="#/mediaserviceV2/settings"]'));
  this.addResourceButton = element(by.cssContainingText('button', 'Add Resource'));
  this.mediaCluster = element(by.cssContainingText('.ui-grid-header-cell-label', 'Media Clusters'));
  this.serviceStatus = element(by.cssContainingText('.ui-grid-header-cell-label', 'Service Status'));
  this.emailNotificationsHeading = element(by.cssContainingText('.section__title', 'Email Notifications'));
  this.deactivateServiceHeading = element(by.cssContainingText('.section__title', 'Deactivate Service'));
  this.documentationAndSoftware = element(by.cssContainingText('.section__title', 'Documentation and Software'));
  this.deactivateButton = element(by.cssContainingText('button', 'Deactivate'));

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

  this.clickMetrics = function () {
    navigation.clickReports();
    utils.click(this.metricsTab);
    navigation.expectCurrentUrl('/reports/metrics');
  };

  this.clickResource = function () {
    navigation.clickServicesTab();
    utils.click(this.resourceButton);
    navigation.expectCurrentUrl('/mediaserviceV2');
  };

  this.clickSettings = function () {
    navigation.clickServicesTab();
    utils.click(this.settingsButton);
    navigation.expectCurrentUrl('/mediaserviceV2/settings');
  };
};

module.exports = MediaServicePage;
