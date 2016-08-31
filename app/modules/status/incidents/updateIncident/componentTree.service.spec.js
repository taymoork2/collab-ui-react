/**
 * Created by pso on 16-8-25.
 */

'use strict';

describe('ComponentService service', function () {
  var $httpBackend;
  var ComponentService;
  var getActiveHostsURL = 'https://dataservicesbts.webex.com/status/services/:siteId/components';
  var activeHosts = [{ id: 1, name: 'Bob' }];
  function dependencies(_$httpBackend_, _ComponentService_) {
    $httpBackend = _$httpBackend_;
    ComponentService = _ComponentService_;
  }
  beforeEach(angular.mock.module('Status.incidents'));
  beforeEach(inject(dependencies));

  it('should exist', function () {
    expect(ComponentService).toBeDefined();
  });


  it('should return data', function () {

    ComponentService.query({ "siteId": 1 }).$promise.then(function (data) {
      expect(data).not.toEqual(null);
    });
  });

  it('Should get getActiveHostsURL', function () {
    $httpBackend.when('GET', getActiveHostsURL).respond(activeHosts);
    expect(activeHosts[0].name).toBe('Bob');
  });

});
