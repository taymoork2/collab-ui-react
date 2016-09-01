(function () {
  'use strict';

  angular.module('WebExApp').service('WebexReportService', WebexReportService);

  /* @ngInject */
  function WebexReportService(
    $log,
    $q,
    $translate,
    Log,
    Authinfo,
    WebExUtilsFact,
    WebExXmlApiFact,
    WebExXmlApiInfoSvc
  ) {
    var self = this;
    //ok, we need a unique global self.
    //the above self is overloaded in places.

    //var loc = $translate.use().replace("_", "-");

    var common_reports_pageids = ["meetings_in_progess",
      "meeting_usage",
      "recording_usage",
      "storage_utilization",
      "inactive_user",
    ];

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

    //This can be used for translations
    //Actually reverse mapping should be used for
    //translations.
    var pageid_to_navItemId_mapping = {
      "meeting_in_progess": "meetings_in_progress",
      "meeting_usage": "meeting_usage",
      "recording_usage": "recording_storage_usage",
      "storage_utilization": "storage_utilization_by_user",
      "inactive_user": "inactive_user",
      "event_center_overview": "ec_report_summary",
      "event_center_scheduled_events": "ec_scheduled_events",
      "event_center_held_events": "ec_held_events",
      "event_center_report_template": "ec_report_templates",
      "event_center_site_summary": "ec_site_summary",
      "support_center_call_volume": "sc_call_volume",
      "remote_access_computer_tracking": "sc_computer_tracking",
      "remote_access_computer_usage": "sc_computer_usage",
      "support_center_csr_activity": "sc_csr_activity",
      "support_center_allocation_queue": "sc_allocation_queue",
      "support_center_url_referral": "sc_url_referral",
      "remote_access_csrs_usage": "sc_csrs_usage_report",
      "support_center_support_sessions": "sc_session_query_tool",
      "coupon": "tc_coupon_usage",
      "recording": "tc_recorded_session_access_report",
      "registration": "tc_registration_report",
      "attendee": "tc_training_report_attendee",
      "training_usage": "tc_usage"
    };

    //All card names are hard coded in all languages except for the commom
    //reports tag.
    var card_name_translations = {
      "training_center": "Training Center",
      "support_center": "Support Center",
      "event_center": "Event Center",
      "remote_access": "Remote Access"
    };

    /*var pinnnedItems = ["meeting_usage", "attendee", "event_center_overview",
      "support_center_allocation_queue"
    ];*/

    var pinnnedItems = ["meeting_in_progess", "training_usage", "event_center_overview",
      "support_center_support_sessions", "remote_access_computer_usage"
    ];

    this.reverseMapping = function (mapping) {
      var keys = [];
      for (var key in mapping) {
        if (mapping.hasOwnProperty(key)) {
          keys.push(key);
        }
      }
      var reversedMap = {};
      for (var i in keys) {
        var k = keys[i];
        var v = mapping[k];
        reversedMap[v] = k;
      }
      return reversedMap;
    };

    var pageid_to_navItemId_mapping_reversed = this.reverseMapping(pageid_to_navItemId_mapping);
    this.pageid_to_navItemId_mapping_reversed = pageid_to_navItemId_mapping_reversed;

    this.getNavItemsByCategoryName = function (navInfo, categoryName) {
      var funcName = "getNavItemsByCategoryName()";
      var logMsg = "";

      var siteAdminNavUrl = null;

      if (navInfo.ns1_siteAdminNavUrl.length) {
        siteAdminNavUrl = navInfo.ns1_siteAdminNavUrl;
      } else {
        siteAdminNavUrl = [];
        siteAdminNavUrl.push(navInfo.ns1_siteAdminNavUrl);
      }

      logMsg = funcName + "\n" +
        "categoryName=" + categoryName + "\n" +
        "navInfo.ns1_siteAdminNavUrl=" + JSON.stringify(navInfo.ns1_siteAdminNavUrl) + "\n" +
        "siteAdminNavUrl=" + JSON.stringify(siteAdminNavUrl);
      $log.log(logMsg);

      var filterByCategoryName = function (navElement) {
        var returnValue = false;

        if (navElement.ns1_category === categoryName) {
          returnValue = true;
        }

        return returnValue;
      };

      return siteAdminNavUrl.filter(filterByCategoryName);
    };

    var UIsref = function (theUrl, rid, siteUrl) {
      this.siteUrl = siteUrl;
      this.reportPageId = rid;
      this.reportPageId_translated = $translate.instant("webexSiteReports." +
        rid);
      this.reportPageIframeUrl = theUrl;
      this.modifiedUrl = this.reportPageIframeUrl;
      this.toUIsrefString = function () {
        return "webex-reports.webex-reports-iframe({" +
          "  siteUrl:" + "'" + this.siteUrl + "'" + "," +
          "  reportPageId:" + "'" + this.reportPageId + "'" + "," +
          "  reportPageIframeUrl:" + "'" + this.reportPageIframeUrl + "'" +
          "})";
      };
      this.uisrefString = this.toUIsrefString();
      //that is always the first link if it appears with other links in a card
      this.isPinned = function () {
        var rid = this.reportPageId;
        var idx = pinnnedItems.indexOf(rid);
        return idx !== -1;
      };
    };

    this.instantiateUIsref = function (theUrl, rid, siteUrl) {
      return new UIsref(theUrl, rid, siteUrl);
    };

    var getUISrefs = function (navItems, siteUrl) {
      var toUisref = function (ni) {
        var navItemId = ni.ns1_navItemId;
        var theUrl = ni.ns1_url;
        var pageId = pageid_to_navItemId_mapping_reversed[navItemId];
        return new UIsref(theUrl, pageId, siteUrl);
      };
      return navItems.map(toUisref);
    };

    this.getUISrefs = getUISrefs;

    var ReportsSection = function (sectionName, siteUrl, reportLinks, categoryName, lang) {
      var self = this;
      this.section_name = sectionName;
      this.site_url = siteUrl;
      this.report_links = reportLinks;
      this.category_Name = categoryName;
      this.lang = lang;

      this.translate_section_name = function (sec_name) {
        var translated_name = sec_name;
        //only translate common reports

        var name = sec_name.toLowerCase();
        var isCommonReport = (name == "common_reports");
        if (isCommonReport) {
          translated_name = $translate.instant("webexSiteReports." + self.section_name);
        } else {
          translated_name = card_name_translations[sec_name];
        }
        return translated_name;
      };
      this.section_name_translated = this.translate_section_name(this.section_name);

      //We have to rewrite this with the actual uirefs with proper reportids
      //right now I've hardcoded as reportID.
      this.uisrefs = self.report_links.map(function (thelink) {
        return new UIsref(thelink, "ReportID", self.site_url);
      });
      this.isEmpty = function () {
        return (angular.isUndefined(self.uisrefs)) || (self.uisrefs.length === 0);
      };
      this.isNotEmpty = function () {
        return !self.isEmpty();
      };
      this.subsections = [];
      this.hasNoSubsections = function () {
        return (angular.isUndefined(self.subsections)) || (self.subsections.length === 0);
      };
      this.hasSubsections = function () {
        return !self.hasNoSubsections();
      };
      this.addSubsection = function (reportsSection) {
        self.subsections.push(reportsSection);
      };
      this.sort = function () {
        var refs = self.uisrefs;
        var theComparator = function (aRef, bRef) {
          var atranslatedString = aRef.reportPageId_translated;
          var btranslatedString = bRef.reportPageId_translated;
          var loc = $translate.use().replace("_", "-");
          var compareResult = atranslatedString.localeCompare(btranslatedString, loc);
          return compareResult;
        };
        refs.sort(theComparator);
      };
      this.doPin = function () {
        if (self.isNotEmpty()) {
          var pinnedA = self.uisrefs.filter(function (ref) {
            return ref.isPinned();
          });
          var notPinnedA = self.uisrefs.filter(function (ref) {
            return !ref.isPinned();
          });
          self.uisrefs = pinnedA.concat(notPinnedA);
        }
      };

    };

    this.ReportsSection = ReportsSection;

    var Reports = function () {
      this.sections = [];
      this.setSections = function (secs) {
        var nonEmptySections = secs.filter(function (s) {
          return s.isNotEmpty();
        });
        this.sections = nonEmptySections;
      };
      this.getSections = function () {
        return this.sections;
      };
    };

    this.getReports = function (siteUrl, mapJson) {
      var funcName = "getReports()";
      var logMsg = "";

      logMsg = funcName + "\n" +
        "siteUrl=" + siteUrl;
      $log.log(logMsg);

      //get the reports list, for now hard code.
      var common_reports = new ReportsSection("common_reports", siteUrl, ["/x/y/z", "/u/io/p"], "CommonReports");
      var event_center = new ReportsSection("event_center", siteUrl, ["/u/y/z", "www.yahoo.com"], "EC", "en");
      var support_center = new ReportsSection("support_center", siteUrl, ["/u/y/z", "www.yahoo.com"], "SC", "en");
      var training_center = new ReportsSection("training_center", siteUrl, ["/u/y/z", "www.yahoo.com"], "TC", "en");
      var remote_access = new ReportsSection("remote_access", siteUrl, ["/u/y/z", "www.yahoo.com"], "RA", "en");

      if (angular.isDefined(mapJson)) {
        //use the above 5 lists to gather all the UISrefs
        [
          [common_reports_pageids, common_reports],
          [training_center_pageids, training_center],
          [support_center_pageids, support_center],
          [event_center_pageids, event_center],
          [remote_access_pageids, remote_access]
        ].forEach(function (xs) {
          var section = xs[1];
          var category_Name = section.category_Name;

          var navItemsFilteredByCategoryName = self.getNavItemsByCategoryName(
            mapJson.bodyJson,
            category_Name
          );

          section.uisrefs = getUISrefs(navItemsFilteredByCategoryName, siteUrl);
        });

        if (remote_access.isNotEmpty()) {
          support_center.addSubsection(remote_access);
          remote_access.sort();
          remote_access.doPin();
        }
      }

      var sections = [common_reports, training_center, support_center, event_center];

      sections.forEach(function (sec) {
        sec.sort();
        sec.doPin();
      });

      var repts = new Reports();
      repts.setSections(sections);
      return repts;
    }; // getReports()

    this.initReportsObject = function (requestedSiteUrl) {
      // var funcName = "initReportsObject()";
      // var logMsg = funcName;

      var siteUrl = requestedSiteUrl || '';
      var siteName = WebExUtilsFact.getSiteName(siteUrl);

      var infoCardObj = WebExUtilsFact.getNewInfoCardObj(
        siteUrl,
        "icon icon-circle-group",
        "icon icon-circle-clock"
      );

      infoCardObj.iframeLinkObj1.iframePageObj = {
        id: "infoCardMeetingInProgress",
        label: $translate.instant("webexSiteReports.meeting_in_progess"),
        uiSref: null
      };

      infoCardObj.iframeLinkObj2.iframePageObj = {
        id: "infoCardMeetingUsage",
        label: $translate.instant("webexSiteReports.meeting_usage"),
        uiSref: null
      };

      var reportsObject = {
        viewReady: false,
        hasLoadError: false,
        sessionTicketError: false,
        cardsSectionId: siteUrl + "-" + "cardsSection",
        siteUrl: siteUrl,
        siteName: siteName,
        infoCardObj: infoCardObj
      };

      WebExXmlApiFact.getSessionTicket(siteUrl, siteName).then(
        function getSessionTicketSuccess(sessionTicket) {
          // var funcName = "initReportsObject().getSessionTicketSuccess()";
          // var logMsg = "";

          WebExXmlApiInfoSvc.xmlApiUrl = "https://" + siteUrl + "/WBXService/XMLService";
          WebExXmlApiInfoSvc.webexSiteName = siteName;
          WebExXmlApiInfoSvc.webexAdminID = Authinfo.getPrimaryEmail();
          WebExXmlApiInfoSvc.webexAdminSessionTicket = sessionTicket;

          var navInfoDef = self.getNaviationInfo();

          navInfoDef.then(
            function getNaviationInfoSuccess(result) {
              var funcName = "initReportsObject().getNaviationInfoSuccess()";
              var logMsg = "";

              // start of replacing result with something we want to test
              /*
              var reportPagesInfoXml = '';

              reportPagesInfoXml = reportPagesInfoXml + '<?xml version="1.0" encoding="UTF-8"?>\n<serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:com="http://www.webex.com/schemas/2002/06/common" xmlns:ns1="http://www.webex.com/schemas/2002/06/service/site" xmlns:event="http://www.webex.com/schemas/2002/06/service/event"><serv:header><serv:response><serv:result>SUCCESS</serv:result><serv:gsbStatus>PRIMARY</serv:gsbStatus></serv:response></serv:header><serv:body><serv:bodyContent xsi:type="ns1:getSiteAdminNavUrlResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
              // reportPagesInfoXml = reportPagesInfoXml + '<ns1:siteAdminNavUrl><ns1:type>Report</ns1:type><ns1:category>CommonReports</ns1:category><ns1:navItemId>meetings_in_progress</ns1:navItemId><ns1:url>https://wbxdmz.admin.ciscospark.com/wbxadmin/MeetingsInProgress.do?proxyfrom=atlas&amp;siteurl=sjsite04</ns1:url></ns1:siteAdminNavUrl>';
              reportPagesInfoXml = reportPagesInfoXml + '<ns1:siteAdminNavUrl><ns1:type>Report</ns1:type><ns1:category>CommonReports</ns1:category><ns1:navItemId>inactive_user</ns1:navItemId><ns1:url>https://wbxdmz.admin.ciscospark.com/wbxadmin/inactiveUsersReport.do?proxyfrom=atlas&amp;siteurl=sjsite04</ns1:url></ns1:siteAdminNavUrl>';
              // reportPagesInfoXml = reportPagesInfoXml + '<ns1:siteAdminNavUrl><ns1:type>Report</ns1:type><ns1:category>CommonReports</ns1:category><ns1:navItemId>meeting_usage</ns1:navItemId><ns1:url>https://wbxdmz.admin.ciscospark.com/wbxadmin/usageReport.do?proxyfrom=atlas&amp;siteurl=sjsite04</ns1:url></ns1:siteAdminNavUrl>';
              // reportPagesInfoXml = reportPagesInfoXml + '<ns1:siteAdminNavUrl><ns1:type>Report</ns1:type><ns1:category>CommonReports</ns1:category><ns1:navItemId>recording_storage_usage</ns1:navItemId><ns1:url>https://wbxdmz.admin.ciscospark.com/wbxadmin/nbrReport.do?proxyfrom=atlas&amp;siteurl=sjsite04</ns1:url></ns1:siteAdminNavUrl>';
              // reportPagesInfoXml = reportPagesInfoXml + '<ns1:siteAdminNavUrl><ns1:type>Report</ns1:type><ns1:category>CommonReports</ns1:category><ns1:navItemId>storage_utilization_by_user</ns1:navItemId><ns1:url>https://wbxdmz.admin.ciscospark.com/wbxadmin/storageReport.do?proxyfrom=atlas&amp;siteurl=sjsite04</ns1:url></ns1:siteAdminNavUrl>';
              reportPagesInfoXml = reportPagesInfoXml + '</serv:bodyContent></serv:body></serv:message>';

              result = {
                'reportPagesInfoXml': reportPagesInfoXml
              };
              */
              // end of replace

              logMsg = funcName + ": " + "result=" + "\n" +
                JSON.stringify(result);
              $log.log(logMsg);

              var reportPagesInfoJson = WebExUtilsFact.validateAdminPagesInfoXmlData(result.reportPagesInfoXml);

              logMsg = funcName + ": " + "reportPagesInfoJson.headerJson=" + "\n" +
                JSON.stringify(reportPagesInfoJson.headerJson);
              // $log.log(logMsg);

              logMsg = funcName + ": " + "reportPagesInfoJson.bodyJson=" + "\n" +
                JSON.stringify(reportPagesInfoJson.bodyJson);
              // $log.log(logMsg);

              if (
                ("" !== reportPagesInfoJson.errId) ||
                ("" !== reportPagesInfoJson.errReason)
              ) {

                reportsObject.hasLoadError = true;
              } else {
                reportsObject["mapJson"] = reportPagesInfoJson;

                var rpts = self.getReports(siteUrl, reportPagesInfoJson);

                if (
                  (null == rpts) ||
                  (0 >= rpts.length)
                ) {

                  logMsg = funcName + "\n" +
                    "ERROR: rpts=" + JSON.stringify(rpts) + "\n" +
                    "siteUrl=" + reportsObject.siteUrl;
                  Log.error(logMsg);

                  reportsObject.hasLoadError = true;
                  reportsObject.invalidNavUrls = true;
                } else {
                  reportsObject["reports"] = rpts;

                  var i = 0;
                  var j = 0;

                  for (i = 0; i < rpts.sections.length; i++) {
                    if (rpts.sections[i].section_name === "common_reports") {
                      for (j = 0; j < rpts.sections[i].uisrefs.length; j++) {
                        if (rpts.sections[i].uisrefs[j].reportPageId === "meetings_in_progress") {
                          reportsObject.infoCardObj.iframeLinkObj1.iframePageObj.uiSref = rpts.sections[i].uisrefs[j].toUIsrefString();
                        }

                        if (rpts.sections[i].uisrefs[j].reportPageId === "meeting_usage") {
                          reportsObject.infoCardObj.iframeLinkObj2.iframePageObj.uiSref = rpts.sections[i].uisrefs[j].toUIsrefString();
                        }
                      }
                    }
                  }

                  reportsObject["viewReady"] = true;
                }
              }
            }, // getNaviationInfoSuccess()

            function getNaviationInfoError() {
              reportsObject.hasLoadError = true;
            } // getNaviationInfoError()
          );

          // what is purpose of this???
          //_this.getSiteSettingsInfo();
        }, // getSessionTicketSuccess()

        function getSessionTicketError(errId) {
          var funcName = "initReportsObject().getSessionTicketError()";
          var logMsg = "";

          logMsg = funcName + ": " + "errId=" + errId;
          Log.debug(logMsg);

          reportsObject["sessionTicketError"] = true;
          reportsObject["hasLoadError"] = true;
        } // getSessionTicketError()
      ); // _this.getSessionTicket().then()

      return reportsObject;
    }; //end initReportsObject

    this.getNaviationInfo = function () {
      var reportPagesInfoXml = WebExXmlApiFact.getReportPagesInfo(WebExXmlApiInfoSvc);

      return $q.all({
        // siteInfoXml: siteInfoXml,
        // meetingTypesInfoXml: meetingTypesInfoXml,
        reportPagesInfoXml: reportPagesInfoXml
      });
    };

  } //end top level service function
})();
