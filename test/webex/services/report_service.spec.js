'use strict';

//Below is the Test Suit written for FaultRuleService
describe('Service: reportService', function () {

  //load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  //Initialize variables
  var reportService, httpBackend, WebExUtilsFact, testReports;

  beforeEach(inject(function ($httpBackend, _reportService_) {

    //httpBackend = $httpBackend;

    reportService = _reportService_;
    httpBackend = $httpBackend;
    //WebExUtilsFact = _WebExUtilsFact_;

    //ReportsSection = function (sectionName, siteUrl, reportLinks, categoryName)
    testReports = new reportService.ReportsSection("testReports", "mojoco.webex.com", ["x", "y"], "testReportsCat");

  }));

  // it("reportService should be defined", function () {
  //   expect(reportService).toBeDefined();
  // });

  it("webex: can reverse mapping", function () {
    var mapping = {
      "x": "y",
      "w": "z"
    };
    var reversedMap = reportService.reverseMapping(mapping);
    var x = reversedMap["y"];
    var w = reversedMap["z"];
    expect(x).toBe("x");
    expect(w).toBe("w");
  });

  it("webex: reports section has correct section name", function () {
    expect(testReports.section_name).toBe("testReports");
  });

});
