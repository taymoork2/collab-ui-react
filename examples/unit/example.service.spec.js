'use strict';

describe('Service: ExampleService', function () {
  var ExampleService, $httpBackend;

  beforeEach(module('AtlasExample'));
  beforeEach(inject(dependencies));
  afterEach(verifyHttpBackend);

  function dependencies(_$httpBackend_, _ExampleService_) {
    $httpBackend = _$httpBackend_;
    ExampleService = _ExampleService_;
  }

  function verifyHttpBackend() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  }

  describe('getAndAddSomething()', function () {
    it('should make a parametrized GET and modify the response', function () {
      $httpBackend.expectGET('/example/test').respond({
        name: 'exampleTest'
      });

      ExampleService.getAndAddSomething('test')
        .then(function (response) {
          expect(response).toEqual(jasmine.objectContaining({
            name: 'exampleTest',
            something: 'mySomething'
          }));
        });

      $httpBackend.flush();
    });

    it('should make a parametrized GET and return empty object on error', function () {
      $httpBackend.expectGET('/example/test').respond(500);

      ExampleService.getAndAddSomething('test')
        .then(function (response) {
          expect(response).toEqual({});
        });

      $httpBackend.flush();
    });
  });
});
