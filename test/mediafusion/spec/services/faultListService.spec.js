'use strict';

//Below is the Test Suit written for FaultRuleService
describe('Service: FaultRuleService', function () {

  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  //Initialize variables
  var FaultRuleService,httpBackend,metriclistData;

  /* Instantiate service.
  * Reading the json data to application variable.
  * Making a fake call to return json data to make unit test cases to be passed.
  */
  beforeEach(inject(function ($httpBackend,_FaultRuleService_) {
   
   
    //httpBackend = $httpBackend;

   
   
FaultRuleService = _FaultRuleService_;
   
    
    

  }));



  //Test Specs
  it("FaultRuleService should be defined", function(){
      expect(FaultRuleService).toBeDefined();
  });

  it("FaultRuleService.listSystemTypes should be defined", function(){
      expect(FaultRuleService.listSystemTypes).toBeDefined();
  });

  it("FaultRuleService.listSystems should be defined", function(){
      expect(FaultRuleService.listSystems).toBeDefined();
  });

  it("FaultRuleService.listMetricTypes should be defined", function(){
      expect(FaultRuleService.listMetricTypes).toBeDefined();
  });

  it("FaultRuleService.listMetricCounters should be defined", function(){
      expect(FaultRuleService.listMetricCounters).toBeDefined();
  });

  it("FaultRuleService.addThreshold should be defined", function(){
      expect(FaultRuleService.addThreshold).toBeDefined();
  });
  
  it("Root Scope should not be null", function(){
      expect(FaultRuleService.$rootScope).not.toBeNull();
  });

  it("Meeting URL from Config baseUrl should not be null", function(){
      expect(FaultRuleService.baseUrl).not.toBeNull();
  });

  it("Final fault parametrised URL should not be null", function(){
      expect(FaultRuleService.sysTypesListUrl).not.toBeNull();
  });

  it("Final fault parametrised URL should not be null", function(){
      expect(FaultRuleService.sysNamesListUrl).not.toBeNull();
  });

  it("Final fault parametrised URL should not be null", function(){
      expect(FaultRuleService.metricTypesListUrl).not.toBeNull();
  });

  it("Final fault parametrised URL should not be null", function(){
      expect(FaultRuleService.metricCountersListUrl).not.toBeNull();
  });

  it("Final fault parametrised URL should not be null", function(){
      expect(FaultRuleService.addThresholdUrl).not.toBeNull();
  });
  
  
  it("HTTP should not be null", function(){
      expect(FaultRuleService.$http).not.toBeNull();
  });

 


});
