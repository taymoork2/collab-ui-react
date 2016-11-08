'use strict';

describe('Service: gemService', function () {
  var $httpBackend, gemservice;
  var spData = getJSONFixture('gemini/servicepartner.json');

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initSpecs);

  function dependencies(_$httpBackend_, _gemService_) {
    $httpBackend = _$httpBackend_;
    gemservice = _gemService_;
  }

  function initSpecs() {
    $httpBackend.expectGET(/.*\/servicepartner.*/g).respond(200, spData.success);
  }

  it('gemservice should be created successfully', function () {
    expect(gemservice).toBeDefined();
  });

  it('should getSpData return json data', function () {
    gemservice.getSpData().then(function (res) {
      expect(res.content.data.body).toBeDefined();
    });
    $httpBackend.flush();
  });
});
