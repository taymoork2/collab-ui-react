/**
 * 
 */
'use strict';

var SiteReportsPage = function () {

  this.testInfo = {
    describeCount: 0,
    siteUrl: null,
    siteType: null,
    describeText: null
  };

  this.testAdmin1 = {
    username: 'sjsite14@mailinator.com',
    password: 'Cisco!23',
  };

  this.testAdmin2 = {
    username: 'cisjsite002@mailinator.com',
    password: 'Cisco!23',
  }

  this.webexReportCrumb1 = element(by.id('webexReportIFrameCrumb1'));
  this.webexReportCrumb2 = element(by.id('webexReportIFrameCrumb2'));

  this.conferencing = element(by.css('a[href="#site-list"]'));
  this.configureSJSITE14Cog = element(by.id("sjsite14.webex.com_webex-site-reports"));
  this.configureCISJSITE002Cog = element(by.id("cisjsite002.webex.com_webex-site-reports"));
  this.webexReportsLink = element(by.css('a[href="#/reports/webex"]'));
  this.webexSiteReportsPanel = element(by.css('#reportsPanel'));
  this.webexCommonMeetingUsageLink = element(by.id('meeting_usage'));
  this.webexCommonMeetingsInProgressLink = element(by.id('meeting_in_progess'));
  this.webexCommonInfoCardMeetingInProgress = element(by.id('infoCardMeetingInProgress'));
  this.webexCommonInfoCardMeetingUsage = element(by.id('infoCardMeetingUsage'));
  this.webexReportsIndexLoading = element(by.id('reportsIndexLoading'));
  this.webexCommonRecordingUsageLink = element(by.id('recording_usage'));
  this.webexCommonStorageUsageLink = element(by.id('storage_utilization'));

  this.reportEngagementId = element(by.id('engagementReports'));
  this.sjsite14CardsSectionId = element(by.id("sjsite14.webex.com-cardsSection"));
  this.cisjsite002CardsSectionId = element(by.id("cisjsite002.webex.com-cardsSection"));
  this.webexCommonReportsCardId = element(by.id('common_reports'));
  this.webexCommonMeetingUsageId = element(by.id('webexSiteReportIframe-meeting_usage'));
  this.webexCommonMeetingsInProgressId = element(by.id('webexSiteReportIframe-meeting_in_progess'));
  this.webexCommonRecordingUsageId = element(by.id('webexSiteReportIframe-recording_usage'));
  this.webexCommonStorageUsageId = element(by.id('webexSiteReportIframe-storage_utilization'));

  this.siteAdminReportsUrl = '/webexreports';

  this.lastSyncElement = element(by.id('reportsRefreshData'));
};

module.exports = SiteReportsPage;
