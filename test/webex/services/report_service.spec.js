'use strict';

//Below is the Test Suit written for FaultRuleService
describe('Service: reportService', function () {

  //load the service's module
  beforeEach(module('WebExReports'));

  //Initialize variables
  var reportService, httpBackend;

  beforeEach(inject(function ($httpBackend, _$reportService_) {

    //httpBackend = $httpBackend;

    reportService = _$reportService_;
    httpBackend = $httpBackend;

  }));

  // it("reportService should be defined", function () {
  //   expect(reportService).toBeDefined();
  // });

});
