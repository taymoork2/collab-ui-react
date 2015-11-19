/**
 * 
 */
'use strict';

var SiteReportsPage = function () {

  this.testAdmin = {
    username: 'sjsite14@mailinator.com',
    password: 'Cisco!23',
  };

  this.testAdmin2 = {
    username: 't30citestprov9@mailinator.com',
    password: 'Cisco!23',
  }

  this.webexSiteReportsPanel = element(by.css('#reportsPanel'));

  this.webexReportCrumb1 = element(by.id('webexReportIFrameCrumb1'));
  this.webexReportCrumb2 = element(by.id('webexReportIFrameCrumb2'));

  this.webexReportsLink = element(by.css('a[href="#/reports/webex"]'));
  this.webexCommonMeetingUsageLink = element(by.id('meeting_usage'));
  this.webexCommonMeetingsInProgressLink = element(by.id('meeting_in_progess'));
  this.webexCommonRecordingUsageLink = element(by.id('recording_usage'));
  this.webexCommonStorageUsageLink = element(by.id('storage_utilization'));

  this.reportEngagementId = element(by.id('engagementReports'));
  this.webexCommonReportsCardId = element(by.id('common_reports'));
  this.webexCommonMeetingUsageId = element(by.id('webexSiteReportIframe-meeting_usage'));
  this.webexCommonMeetingsInProgressId = element(by.id('webexSiteReportIframe-meeting_in_progess'));
  this.webexCommonRecordingUsageId = element(by.id('webexSiteReportIframe-recording_usage'));
  this.webexCommonStorageUsageId = element(by.id('webexSiteReportIframe-storage_utilization'));

  this.siteAdminReportsUrl = '/webexreports';

  this.lastSyncElement = element(by.id('reportsRefreshData'));
};

module.exports = SiteReportsPage;
