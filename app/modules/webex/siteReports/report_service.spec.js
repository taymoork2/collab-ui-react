'use strict';

//Below is the Test Suit written for FaultRuleService
describe('Service: WebexReportService', function () {

  //load the service's module
  //beforeEach(module('wx2AdminWebClientApp'));
  beforeEach(module('wx2AdminWebClientApp'));

  // beforeEach(module(function ($provide) {
  //   $provide.value("$translate", {
  //     'use': function () {
  //       return "en_US.json";
  //     }
  //   });
  // }));
  //Initialize variables
  var WebexReportService, httpBackend, WebExUtilsFact, testReports, $translate, reportService;

  beforeEach(inject(function ($httpBackend, _WebexReportService_, _$translate_) {

    //httpBackend = $httpBackend;
    var useLocale = "en_US";

    WebexReportService = _WebexReportService_;
    httpBackend = $httpBackend;

    // $translate = {
    //   'use': function () {
    //     return "en_US.json";
    //   }
    // };
    $translate = _$translate_;
    // $translate.use = function () {
    //   return "en_US.json";
    // };
    //spyOn($translate, 'use').and.returnValue(useLocale);
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
    var reversedMap = WebexReportService.reverseMapping()(mapping);
    var x = reversedMap["y"];
    var w = reversedMap["z"];
    expect(x).toBe("x");
    expect(w).toBe("w");
  });

  it("webex: reports section has correct section name", function () {
    expect(testReports.section_name).toBe("testReports");
  });

});
