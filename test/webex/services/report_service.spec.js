'use strict';

//Below is the Test Suit written for FaultRuleService
describe('Service: WebexReportService', function () {

  //load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  //Initialize variables
  var WebexReportService, httpBackend, WebExUtilsFact, testReports;

  beforeEach(inject(function ($httpBackend, _WebexReportService_) {

    //httpBackend = $httpBackend;

    WebexReportService = _WebexReportService_;
    httpBackend = $httpBackend;
    //WebExUtilsFact = _WebExUtilsFact_;

    //ReportsSection = function (sectionName, siteUrl, reportLinks, categoryName)
    testReports = new WebexReportService.ReportsSection("testReports", "mojoco.webex.com", ["x", "y"], "testReportsCat");

  }));

  // it("WebexReportService should be defined", function () {
  //   expect(WebexReportService).toBeDefined();
  // });

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

});
