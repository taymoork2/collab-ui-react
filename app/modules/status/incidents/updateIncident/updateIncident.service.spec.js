/**
 * Created by pso on 16-8-25.
 */

'use strict';

describe('updateIncident service', function () {
  var $httpBackend;
  var UpdateIncidentService;
  var getActiveHostsURL = 'https://statusbts.webex.com/status/incidents/:incidentId/messages';
  var activeHosts = [{ id: 1, name: 'Bob' }];
  function dependencies(_$httpBackend_, _UpdateIncidentService_) {
    $httpBackend = _$httpBackend_;
    UpdateIncidentService = _UpdateIncidentService_;
  }
  beforeEach(angular.mock.module('Status.incidents'));
  beforeEach(angular.mock.module('Status'));
  beforeEach(angular.mock.module('ui.router'));
  beforeEach(inject(dependencies));

  it('should exist', function () {
    expect(UpdateIncidentService).toBeDefined();
  });

  it('should return data', function () {
    UpdateIncidentService.query().$promise.then(function (data) {
      expect(data).not.toEqual(null);
    });
  });

  it('Should get getActiveHostsURL', function () {
    $httpBackend.expectGET(getActiveHostsURL).respond(activeHosts);
    //$httpBackend.flush();
    expect(activeHosts[0].name).toBe('Bob');
  });
});
