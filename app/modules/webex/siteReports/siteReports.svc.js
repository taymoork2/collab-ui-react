'use strict';

angular.module('WebExReports').service('reportService', function () {

  var ReportsSection = function (sectionName, siteUrl, reportLink) {
    this.section_name = sectionName;
    this.site_url = siteUrl;
    this.report_link = reportLink;
  };
  var Reports = function () {
    this.sections = [];
    this.setSections = function (secs) {
      this.sections = secs;
    };
  };

  this.getReports = function (siteUrl) {

    //get the reports list, for now hard code.

    var sec1 = new ReportsSection("Section1", siteUrl, "/x/y/z");
    var sec2 = new ReportsSection("Section2", siteUrl, "/u/y/z");

    var repts = new Reports();
    repts.setSections([sec1, sec2]);

  };

});
