'use strict';

//Below is the Test Suit written for FaultRuleService
describe('WebexReportService Test', function () {

  //load the service's module
  beforeEach(angular.mock.module('WebExApp'));

  // beforeEach(angular.mock.module(function ($provide) {
  //   $provide.value("$translate", {
  //     'use': function () {
  //       return "en_US.json";
  //     }
  //   });
  // }));
  //Initialize variables
  var WebexReportService, WebExUtilsFact, testReports, $translate, reportService;
  var ref1, ref2;

  beforeEach(inject(function (_WebexReportService_, _$translate_) {

    var useLocale = "en_US";

    WebexReportService = _WebexReportService_;

    // $translate = {
    //   'use': function () {
    //     return "en_US.json";
    //   }
    // };
    $translate = _$translate_;
    // $translate.use = function () {
    //   return "en_US.json";
    // };
    spyOn($translate, 'use').and.returnValue(useLocale);
    //spyOn($translate, 'storageKey').and.returnValue(useLocale);

    //WebExUtilsFact = _WebExUtilsFact_;

    //ReportsSection = function (sectionName, siteUrl, reportLinks, categoryName)
    //testReports = new WebexReportService.ReportsSection("testReports", "mojoco.webex.com", ["x", "y"], "testReportsCat");
    // reportService = $provide.value('WebexReportService', {
    //   $translate: $translate
    // });

    testReports = new WebexReportService.ReportsSection("testReports",
      "mojoco.webex.com", ["x", "y"],
      "testReportsCat");

    ref1 = WebexReportService.instantiateUIsref("www.dontcare.come", "abcReport", "mojoco.webex.com");
    ref2 = WebexReportService.instantiateUIsref("www.dontcare.come", "meeting_in_progess", "mojoco.webex.com");

  }));

  it("Test of a test", function () {
    //expect(WebexReportService).toBeDefined();
    expect("x").toBe("x");
  });

  it("webex: can reverse mapping", function () {
    var mapping = {
      "x": "y",
      "w": "z"
    };
    var reversedMap = WebexReportService.reverseMapping(mapping);
    var x = reversedMap["y"];
    var w = reversedMap["z"];
    expect(x).toBe("x");
    expect(w).toBe("w");
  });

  it("webex: reports section has correct section name", function () {
    expect(testReports.section_name).toBe("testReports");
  });

  it("webex: reports section when sort and pinned, pinned item should be first", function () {

    //the idea here is that even though meeting_usage is second, it should appear first
    //since it is one of the pinned item.

    var trs = testReports;
    trs.uisrefs = [ref1, ref2];

    trs.sort(); //sorts the links
    trs.doPin(); //puts the pinned link at the top.

    var topReportId = trs.uisrefs[0].reportPageId;

    expect(topReportId).toBe("meeting_in_progess");

  });

});
