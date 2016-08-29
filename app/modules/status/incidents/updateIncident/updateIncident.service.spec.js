/**
 * Created by pso on 16-8-25.
 */

'use strict'

describe('updateIncident service',function(){
  var $httpBackend;
  var updateIncidentService;
  var result;
  var $scope;
  var getActiveHostsURL ='https://dataservicesbts.webex.com/status/incidents/:incidentId/messages';
  var activeHosts=[{id:1,name:'Bob'}];
  function dependencies(_$httpBackend_,_updateIncidentService_,_$rootScope_){
    $httpBackend=_$httpBackend_;
    updateIncidentService=_updateIncidentService_;
    $scope=_$rootScope_.$new();
  }
  beforeEach(angular.mock.module('Status.incidents'));
  beforeEach(inject(dependencies));

  it('should exist', function () {
    expect(updateIncidentService).toBeDefined();
  });


  it('should return data',function() {

    updateIncidentService.query().$promise.then(function (data) {
      expect(data).not.toEqual(null);
    })
  });

  it('Should get getActiveHostsURL', function () {
    $httpBackend.expectGET(getActiveHostsURL).respond(activeHosts);

    //$httpBackend.flush();
    expect(activeHosts[0].name).toBe('Bob');
  });

})
