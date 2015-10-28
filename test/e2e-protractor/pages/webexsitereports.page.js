/**
 * 
 */
'use strict';

var SiteReportsPage = function () {

  this.testAdmin = {
    username: 'sjsite14@mailinator.com',
    password: 'Cisco!23',
  };

  this.conferencing = element(by.css('a[href="#site-list"]'));

  this.siteReportsUrl = '/reports';
  this.reportSJSITE14 = element(by.id("sjsite14.webex.com_webex-site-reports"));
  this.webexSiteReportsPanel = element(by.id('webexSiteReports'));
  this.webexReportCrumb = element(by.id('webexReportCrumb'))
  this.webexReportBreadCrumbs = element(by.id('webexReportBreadCrumbs'));
  this.webexReportIFrameBreadCrumbs = element(by.id('webexReportIFrameBreadCrumbs'));
  this.webexReportIFrameCrumb2 = element(by.id('webexReportIFrameCrumb2'));

  this.webexReportsLink = element(by.id('webexReports'));
  this.webexCommonMeetingUsageReportLink = element(by.id('meeting_usage'));

  this.webexCommonReportsCardId = element(by.id('common_reports'));
  this.webexCommonMeetingUsageReportId = element(by.id('webexSiteReportIframe-meeting_usage'));

  this.siteAdminReportsUrl = '/webexreports';
};

module.exports = SiteReportsPage;
