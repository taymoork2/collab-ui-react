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
      var self = this;

      var event_center_pageids = ["event_center_overview",
        "event_center_site_summary",
        "event_center_scheduled_events",
        "event_center_held_events",
        "event_center_report_template"
      ];

      var support_center_pageids = ["support_center_support_sessions",
        "support_center_call_volume",
        "support_center_csr_activity",
        "support_center_url_referral",
        "support_center_allocation_queue"
      ];

      var training_center_pageids = ["training_usage",
        "registration",
        "recording",
        "coupon",
        "attendee"
      ];

      var remote_access_pageids = ["remote_access_computer_usage",
        "remote_access_csrs_usage", "remote_access_computer_tracking"
      ];

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
      var remote_access = new ReportsSection("remote_access", siteUrl, ["/u/y/z", "www.yahoo.com"]);

      var uisrefsArray = [];
      var common_reports_pageids = ["meeting_in_progess", "meeting_usage", "recording_usage",
        "storage_utilization"
      ];


      //use the above 5 lists to gather all the UISrefs
      [
        [common_reports_pageids, common_reports],
        [support_center_pageids, support_center],
        [training_center_pageids, training_center],
        [event_center_pageids, event_center],
        [remote_access_pageids, remote_access]
      ].forEach(function (xs) {
        var pageids = xs[0];
        var section = xs[1];
        section.uisrefs = pageids.map(function (rid) {
          return new UIsref("www.yahoo.com", rid, siteUrl);
        });
      });

      var repts = new Reports();
      repts.setSections([common_reports, support_center,
        training_center, event_center, remote_access
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

          var navInfoDef = self.getNaviationInfo();

          navInfoDef.then(function (result) {
            var resultString = JSON.stringify(result);
            $log.log("Result is ----**** " + resultString);

            var y = WebExUtilsFact.validateAdminPagesInfoXmlData(result.reportPagesInfoXml);

            $log.log("Validated Result is ==== " + JSON.stringify(y.bodyJson));

          });

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

    this.getNaviationInfo = function () {
      var reportPagesInfoXml = WebExXmlApiFact.getAdminPagesInfo(
        false,
        webExXmlApiInfoObj
      );

      return $q.all({
        // siteInfoXml: siteInfoXml,
        // meetingTypesInfoXml: meetingTypesInfoXml,
        reportPagesInfoXml: reportPagesInfoXml
      });
    };

  } //end top level service function 
]);
