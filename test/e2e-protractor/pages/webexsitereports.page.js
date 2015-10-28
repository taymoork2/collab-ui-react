/**
 * 
 */
'use strict';

var SiteReportsPage = function () {

  this.testAdmin = {
    username: 'sjsite14@mailinator.com',
    password: 'Cisco!23',
  };

  this.webexSiteReportsPanel = element(by.id('webexSiteReports'));

  this.webexReportCrumb1 = element(by.id('webexReportIFrameCrumb1'));
  this.webexReportCrumb2 = element(by.id('webexReportIFrameCrumb2'));

  this.webexReportsLink = element(by.id('webexReports'));
  this.webexCommonMeetingUsageLink = element(by.id('meeting_usage'));
  this.webexCommonMeetingsInProgressLink = element(by.id('meeting_in_progess'));

  this.webexCommonReportsCardId = element(by.id('common_reports'));
  this.webexCommonMeetingUsageId = element(by.id('webexSiteReportIframe-meeting_usage'));
  this.webexCommonMeetingsInProgressId = element(by.id('webexSiteReportIframe-meeting_in_progess'));

  this.siteAdminReportsUrl = '/webexreports';
};

module.exports = SiteReportsPage;
