'use strict';

angular.module('WebExReports').service('reportService',

  [
    '$q',
    '$log',
    '$stateParams',
    '$translate',
    '$filter',
    'Authinfo',
    'WebExUtilsFact',
    'WebExXmlApiFact',
    'WebExXmlApiInfoSvc',
    'Notification',

    function () {

      var ReportsSection = function (sectionName, siteUrl, reportLinks) {
        this.section_name = sectionName;
        this.site_url = siteUrl;
        this.report_links = reportLinks;
      };
      var Reports = function () {
        this.sections = [];
        this.setSections = function (secs) {
          this.sections = secs;
        };
        this.getSections = function () {
          return this.sections;
        };
      };

      this.getReports = function (siteUrl) {

        //get the reports list, for now hard code.

        var sec1 = new ReportsSection("Section1", siteUrl, ["/x/y/z", "/u/io/p"]);
        var sec2 = new ReportsSection("Section2", siteUrl, ["/u/y/z", "www.yahoo.com"]);

        var repts = new Reports();
        repts.setSections([sec1, sec2]);

        return repts;

      };

    } //end function 
  ]

);
