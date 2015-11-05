'use strict';

//Below is the Test Suit written for FaultRuleService
describe('WebexReportService Test', function () {

  //load the service's module
  //beforeEach(module('wx2AdminWebClientApp'));
  beforeEach(module('wx2AdminWebClientApp', function ($provide) {
    $provide.value("$translate", {
      'use': function () {
        return "en_US.json";
      }
    });
  }));

  // beforeEach(module(function ($provide) {
  //   $provide.value("$translate", {
  //     'use': function () {
  //       return "en_US.json";
  //     }
  //   });
  // }));
  //Initialize variables
  var WebexReportService, httpBackend, WebExUtilsFact, $provide, testReports, $translate, reportService;

  beforeEach(inject(function ($httpBackend, _WebexReportService_, _$provide_, _$translate_) {

    //httpBackend = $httpBackend;

    $provide = _$provide_;
    WebexReportService = _WebexReportService_;
    httpBackend = $httpBackend;

    $translate = {
      'use': function () {
        return "en_US.json";
      }
    };
    $translate = _$translate_;
    $translate.use = function () {
      return "en_US.json";
    };

    //WebExUtilsFact = _WebExUtilsFact_;

    //ReportsSection = function (sectionName, siteUrl, reportLinks, categoryName)
    //testReports = new WebexReportService.ReportsSection("testReports", "mojoco.webex.com", ["x", "y"], "testReportsCat");
    // reportService = $provide.value('WebexReportService', {
    //   $translate: $translate
    // });

    testReports = WebexReportService.ReportsSection("testReports",
      "mojoco.webex.com", ["x", "y"],
      "testReportsCat");

  }));

  // it("WebexReportService should be defined", function () {
  //   expect(WebexReportService).toBeDefined();
  // });

  // it("webex: can reverse mapping", function () {
  //   var mapping = {
  //     "x": "y",
  //     "w": "z"
  //   };
  //   var reversedMap = WebexReportService.reverseMapping(mapping);
  //   var x = reversedMap["y"];
  //   var w = reversedMap["z"];
  //   expect(x).toBe("x");
  //   expect(w).toBe("w");
  // });

  // it("webex: reports section has correct section name", function () {
  //   expect(testReports.section_name).toBe("testReports");
  // });

});
