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
  this.siteReports = element(by.css('#webex-reports-list-iframe'));
  this.siteReportsUrl = '/webexreports';
  this.reportSJSITE14 = element(by.id("sjsite14.webex.com_webex-site-reports"));
  this.webexReportCrumb = element(by.id('webexReportCrumb'))
  this.webexReportBreadCrumbs = element(by.id('webexReportBreadCrumbs'));
  this.meetingUsageReportLink = element(by.id('meeting_usage'));
  this.webexReportIFrameBreadCrumbs = element(by.id('webexReportIFrameBreadCrumbs'));
  this.webexReportIFrameCrumb2 = element(by.id('webexReportIFrameCrumb2'));
  this.siteAdminReportsUrl = '/webexreports';
};

module.exports = SiteReportsPage;
