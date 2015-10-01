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
      this.reportPageId_translated = $translate.instant("webexSiteReports." +
        rid);
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
      this.section_name_translated = $translate.instant("webexSiteReports." + this.section_name);
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

      var uisrefsArray = [];
      var common_reports_pageids = ["meeting_in_progess", "meeting_usage", "recording_usage",
        "storage_utilization"
      ];
      var event_center_pageids = ["programs_events_recordings", "summary", "scheduled_events_dashboard",
        "held_events_dashboard", "event_center_report_template"
      ];
      var support_center_pageids = ["session_query_tool", "call_volume", "csr_activity", "url_referal",
        "allocation_queue", "webacd_session_query_tool", "webacd_call_volume",
        "webacd_csr_volume", "webacd_csr_activity", "webacd_url_referal",
        "webacd_allocation_queue", "remote_access_computer_usage",
        "remote_access_csrs_usage", "remote_access_computer_tracking"
      ];
      var training_center_pageids = ["usage", "registration", "recorded_session_access",
        "coupon_usage", "training_record_attendee",
        "access_anywhere_usage"
      ];

      //use the above 4 lists to gather all the UISrefs
      [
        [common_reports_pageids, common_reports],
        [support_center_pageids, support_center],
        [training_center_pageids, training_center],
        [event_center_pageids, event_center]
      ].forEach(function (xs) {
        var pageids = xs[0];
        var section = xs[1];
        section.uisrefs = pageids.map(function (rid) {
          return new UIsref("www.yahoo.com", rid, siteUrl);
        });
      });

      var repts = new Reports();
      repts.setSections([common_reports, support_center,
        training_center, event_center
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
