'use strict';

angular.module('WebExReports').service('reportService', [
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
  function (
    $q,
    $log,
    $stateParams,
    $translate,
    $filter,
    Authinfo,
    WebExUtilsFact,
    WebExXmlApiFact,
    webExXmlApiInfoObj,
    Notification
  ) {

    var UIsref = function (theUrl, rid, siteUrl) {
      this.siteUrl = siteUrl;
      this.reportPageId = rid;
      this.reportPageIframeUrl = theUrl;
      this.toUIsrefString = function () {
        return "webex-reports-iframe({" +
          "  siteUrl:" + "'" + this.siteUrl + "'" + "," +
          "  reportPageId:" + "'" + this.reportPageId + "'" + "," +
          "  reportPageIframeUrl:" + "'https://" + this.siteUrl + this.reportPageIframeUrl + "'" +
          "})";
      };
      this.uisrefString = this.toUIsrefString();
    };

    var ReportsSection = function (sectionName, siteUrl, reportLinks) {
      var self = this;
      this.section_name = sectionName;
      this.site_url = siteUrl;
      this.report_links = reportLinks;
      //We have to rewrite this with the actual uirefs with proper reportids
      //right now I've hardcoded as reportID.
      this.uisrefs = self.report_links.map(function (thelink) {
        return new UIsref(thelink, "ReportID", self.site_url);
      });
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
      var common_reports = new ReportsSection("common_reports", siteUrl, ["/x/y/z", "/u/io/p"]);
      var event_center = new ReportsSection("event_center", siteUrl, ["/u/y/z", "www.yahoo.com"]);
      var support_center = new ReportsSection("support_center", siteUrl, ["/u/y/z", "www.yahoo.com"]);
      var training_center = new ReportsSection("training_center", siteUrl, ["/u/y/z", "www.yahoo.com"]);

      var repts = new Reports();
      repts.setSections([common_reports, event_center,
        support_center, training_center
      ]);
      return repts;
    };

    this.initReportsObject = function () {
      var reportsObject = {};
      var funcName = "initReportsObject()";
      var logMsg = funcName;

      var _this = this;
      var displayLabel = null;

      var siteUrl = (!$stateParams.siteUrl) ? '' : $stateParams.siteUrl;
      var siteName = WebExUtilsFact.getSiteName(siteUrl);
      logMsg = funcName + ": " + "\n" +
        "siteUrl=" + siteUrl + "; " +
        "siteName=" + siteName;
      $log.log(logMsg);

      reportsObject["siteUrl"] = siteUrl;
      reportsObject["siteName"] = siteName;

      WebExXmlApiFact.getSessionTicket(siteUrl).then(
        function getSessionTicketSuccess(sessionTicket) {
          var funcName = "initReportsObject().getSessionTicketSuccess()";
          var logMsg = "";

          reportsObject["sessionTicketError"] = false;

          webExXmlApiInfoObj.xmlServerURL = "https://" + siteUrl + "/WBXService/XMLService";
          webExXmlApiInfoObj.webexSiteName = siteName;
          webExXmlApiInfoObj.webexAdminID = Authinfo.getPrimaryEmail();
          webExXmlApiInfoObj.webexAdminSessionTicket = sessionTicket;

          // what is purpose of this???
          //_this.getSiteSettingsInfo();
        }, // getSessionTicketSuccess()

        function getSessionTicketError(errId) {
          var funcName = "initReportsObject().getSessionTicketError()";
          var logMsg = "";

          logMsg = funcName + ": " + "errId=" + errId;
          $log.log(logMsg);

          reportsObject["sessionTicketError"] = true;
        } // getSessionTicketError()
      ); // _this.getSessionTicket().then()

      return reportsObject;
    }; //end initReportsObject
  } //end top level service function 
]);
