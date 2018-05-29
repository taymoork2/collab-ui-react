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
  this.mediaserviceTab = element(by.css('a[href="/reports/mediaservice"]'));
  this.total_calls = element(by.cssContainingText('.metrics-header', 'Total Calls'));
  this.averageutilization = element(by.cssContainingText('.metrics-header', 'Average Utilization'));
  this.clusteravailability = element(by.cssContainingText('.metrics-header', 'Clusters in Service'));
  this.timeFilter = element(by.css('#timeFilter'));
  this.clusterFilter = element(by.css('#clusterFilter'));
  this.internalNumberOptionFirst = element(by.css('.ng-pristine[name="timeFilter"]')).all(by.repeater('option in csSelect.options')).last().element(by.tagName('a'));
  this.utilizationCard = element(by.css('#utilization-card'));
  this.callVolumeCard = element(by.css('#call-volume-card'));
  this.availabilityCard = element(by.css('#availability-card'));
  this.utilizationTitle = element(by.cssContainingText('.report-section-header', 'Resource Utilization'));
  this.callVolumes = element(by.cssContainingText('.report-section-header', 'Total Calls'));
  this.availabilityOfCluster = element(by.cssContainingText('.report-section-header', 'Clusters in Service'));
  this.resourceButton = element(by.css('hybrid-media-active-card a[href="/mediaserviceV2"]'));
  this.settingsButton = element(by.css('hybrid-media-active-card a[href="/mediaserviceV2/settings"]'));
  this.resourceTab = element(by.css('li a[href="/mediaserviceV2"]'));
  this.settingsTab = element(by.css('li a[href="/mediaserviceV2/settings"]'));
  this.addResourceButton = element(by.cssContainingText('button', 'Add Resource'));
  this.mediaCluster = element(by.cssContainingText('.ui-grid-header-cell-label', 'Media Clusters'));
  this.serviceStatus = element(by.cssContainingText('.ui-grid-header-cell-label', 'Service Status'));
  this.emailNotificationsHeading = element(by.cssContainingText('.sub-section__label', 'Email Notifications'));
  this.videoQualityHeading = element(by.cssContainingText('.sub-section__label', 'Video Quality'));
  this.deactivateServiceHeading = element(by.cssContainingText('.sub-section__label', 'Deactivate Webex Video Mesh'));
  this.documentationAndSoftware = element(by.cssContainingText('.sub-section__label', 'Documentation'));
  this.deactivateButton = element(by.cssContainingText('button', 'Deactivate'));
  this.emailNotificationInput = element(by.css('input[type="email"]'));
  this.deactivateServiceModalHeader = element(by.cssContainingText('.modal-title', 'Deactivate Webex Video Mesh'));
  this.deactivateServiceModalCancelButton = element(by.css('button[ng-click="disableServiceDialog.cancel()"]'));
  this.invalidEmailTag = element(by.css('.invalid-tag'));
  this.clusterFirstTr = element(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index').row(0));
  this.clusterFirstTd = element(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index').row(0)).element(by.repeater('(colRenderIndex, col) in colContainer.renderedColumns track by col.uid').row(0));
  this.clusterSecondTd = element(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index').row(0)).element(by.repeater('(colRenderIndex, col) in colContainer.renderedColumns track by col.uid').row(1));
  this.nodesListFirst = element(by.cssContainingText('.feature-name', 'Video Mesh'));
  this.sidePanelHeader = element(by.css('.header-info-wrap')).element(by.css('.header-title'));
  this.upgradeScheduleTitle = element(by.cssContainingText('.section-title-row', 'Upgrade Schedule'));
  this.releaseChannelTitle = element(by.cssContainingText('.section-title-row', 'Release Channel'));
  this.softwareUpgradeTitle = element(by.cssContainingText('.section-title-row', 'Software Upgrade'));
  this.nodesTitle = element(by.cssContainingText('.section-title-row', 'Nodes'));
  this.moveNodeLink = element(by.id('move-ecp'));
  this.deregisterMoveNodeLink = element(by.id('deregister-ecp'));
  this.moveNodeModalHeader = element(by.cssContainingText('.modal-title', 'Move Node'));
  this.deregisterMoveNodeHeader = element(by.cssContainingText('.modal-title', 'Deregister Node'));
  this.moveNodeModalCancelButton = element(by.css('button[ng-click="$dismiss()"]'));
  this.deregisterMoveNodeCancelButton = element(by.css('button[ng-click="$dismiss()"]'));
  this.clusterSettingsLink = element(by.css('a[translate="hercules.softwareUpgrade.editSettingsLink"]'));
  this.clusterSettingsPageHeader = element(by.css('.page-header__title'));
  this.clusterUpgradeTitle = element(by.cssContainingText('.section__title', 'Upgrade'));
  this.generalTitle = element(by.cssContainingText('.section__title', 'General'));
  this.clusterReleaseChannelTitle = element(by.cssContainingText('.section__title', 'Release Channel'));
  this.unifiedCMSIPTrunkTitle = element(by.cssContainingText('.section__title', 'Unified CM SIP Trunk'));
  this.clusterDeleteClusterTitle = element(by.cssContainingText('.section__title', 'Cluster'));
  this.deleteClusterButton = element(by.css('button[ng-click="$ctrl.deregisterCluster()"]'));
  this.deleteClusterModalHeader = element(by.cssContainingText('.modal-title', 'Delete Video Mesh Cluster'));
  this.deleteClusterModalCancel = element(by.css('button[ng-click="$dismiss()"]'));
  this.adoptionTab = element(by.id('adoptionReports'));
  this.totallMeetsHeader = element(by.cssContainingText('.metrics-header', 'Total Number of Meetings'));
  this.meetingHostTypeHeader = element(by.cssContainingText('.metrics-header', 'Meeting Host Type'));
  this.clientTypesHeader = element(by.cssContainingText('.metrics-header', 'Client Types'));
  this.meetHostFlip = element(by.css('i[ng-click="isFlipped=true"]'));
  this.meetHostFlipDiv = element(by.css('.card-desc'));
  this.clientTypeCardDiv = element(by.css('#client-type-card'));
  this.meetLocationCardDiv = element(by.css('#meeting-location-card'));
  this.totMeetsByHostHeader = element(by.cssContainingText('.report-section-header', 'Total Meetings by Host Type'));
  this.clientTypeHeader = element(by.cssContainingText('.report-section-header', 'Client Type Distribution'));
  this.performActionsOnNodeBtn = element(by.cssContainingText('.btn--primary', 'Perform actions on Node'));
  this.actionsBtn = element(by.cssContainingText('.actions-button', 'Actions'));

  this.totalmeetsFlip = element(by.css('i[ng-click="isFlipped=true"]'));
  this.totalmeetsFlipDiv = element(by.css('.span-desc-small'));


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
    utils.click(this.mediaserviceTab);
    navigation.expectCurrentUrl('/reports/mediaservice');
  };

  this.clickResource = function () {
    navigation.clickServicesTab();
    utils.click(this.resourceButton);
  };

  this.clickSettings = function () {
    navigation.clickServicesTab();
    utils.click(this.settingsButton);
    navigation.expectCurrentUrl('/mediaserviceV2/settings');
  };

  this.clickAdoption = function () {
    utils.click(this.adoptionTab);
    navigation.expectCurrentUrl('/reports/mediaservice');
  };
};

module.exports = MediaServicePage;
