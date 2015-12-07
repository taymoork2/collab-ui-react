'use strict';
describe('Service: HelpdeskHealthStatusService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $httpBackend, ReportsService, Service, ServiceDescriptor, $scope, q;

  beforeEach(inject(function (_ReportsService_, _$rootScope_, _HelpdeskHealthStatusService_, _$q_) {
    Service = _HelpdeskHealthStatusService_;
    ReportsService = _ReportsService_;
    $scope = _$rootScope_.$new();
    q = _$q_;
  }));

  describe("health statuses operational", function () {

    var healthReport = {
      "components": [],
      "success": true
    };

    beforeEach(function(){
      sinon.stub(ReportsService, 'healthMonitor');
      ReportsService.healthMonitor.yields(healthReport);
    })

    it("'Mobile Clients' maps to 'message'", function () {
      healthReport.components = [{"name":"Mobile Clients", "status":"operational"}];
      Service.getHealthStatuses().then(function(res){
      expect(res.message).toEqual("operational");
      expect(res.meeting).toEqual("error");
      expect(res.call).toEqual("error");
      expect(res.room).toEqual("error");
      expect(res.hybrid).toEqual("error");
      });
    });

    it("'Rooms' maps to 'message' and 'room'", function () {
      healthReport.components = [{"name":"Rooms", "status":"operational"}];
      Service.getHealthStatuses().then(function(res){
        expect(res.message).toEqual("operational");
        expect(res.meeting).toEqual("error");
        expect(res.call).toEqual("error");
        expect(res.room).toEqual("operational");
        expect(res.hybrid).toEqual("error");
      });
    });

    it("'Web and Desktop Clients' maps to 'message'", function () {
      healthReport.components = [{"name":"Web and Desktop Clients", "status":"operational"}]
      Service.getHealthStatuses().then(function(res){
        expect(res.message).toEqual("operational");
        expect(res.meeting).toEqual("error");
        expect(res.call).toEqual("error");
        expect(res.room).toEqual("error");
        expect(res.hybrid).toEqual("error");
      });
    });

    it("'Media/Calling' maps to 'meeting' and 'call'", function () {
      healthReport.components = [{"name":"Media/Calling", "status":"operational"}];
      Service.getHealthStatuses().then(function(res){
        expect(res.message).toEqual("error");
        expect(res.meeting).toEqual("operational");
        expect(res.call).toEqual("operational");
        expect(res.room).toEqual("error");
        expect(res.hybrid).toEqual("error");
      });
    });

    it("'Cloud Hybrid Services Management' maps to 'hybrid'", function () {
      healthReport.components = [{"name":"Cloud Hybrid Services Management", "status":"operational"}];
      Service.getHealthStatuses().then(function(res){
        expect(res.message).toEqual("error");
        expect(res.meeting).toEqual("error");
        expect(res.call).toEqual("error");
        expect(res.room).toEqual("error");
        expect(res.hybrid).toEqual("operational");
      });
    });

    it("'Calendar Service' maps to 'hybrid'", function () {
      healthReport.components = [{"name":"Calendar Service", "status":"operational"}];
      Service.getHealthStatuses().then(function(res){
        expect(res.message).toEqual("error");
        expect(res.meeting).toEqual("error");
        expect(res.call).toEqual("error");
        expect(res.room).toEqual("error");
        expect(res.hybrid).toEqual("operational");
      });
    });

    it("Status reported with the following priorities: 'error', 'warning', 'partial_outtage', 'operational'", function(){
      healthReport.components = [
        {"name":"Mobile Clients", "status":"error"},
        {"name":"Rooms", "status":"warning"},
        {"name":"Web and Desktop Clients", "status":"partial_outage"},
      ]
      Service.getHealthStatuses().then(function(res){
        expect(res.message).toEqual("error");
      });

      healthReport.components = [
        {"name":"Mobile Clients", "status":"warning"},
        {"name":"Rooms", "status":"partial_outage"},
        {"name":"Web and Desktop Clients", "status":"operational"},
      ]
      Service.getHealthStatuses().then(function(res){
        expect(res.message).toEqual("warning");
      });

      healthReport.components = [
        {"name":"Mobile Clients", "status":"operational"},
        {"name":"Rooms", "status":"operational"},
        {"name":"Web and Desktop Clients", "status":"partial_outage"},
      ]
      Service.getHealthStatuses().then(function(res){
        expect(res.message).toEqual("partial_outage");
      });
    })

  });

});
