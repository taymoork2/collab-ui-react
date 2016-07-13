'use strict';

describe('Service: ExampleService', function () {
  function init() {
    this.initModules('AtlasExample');
    this.injectDependencies('$httpBackend', 'ExampleService');
  }

  function verifyHttpBackend() {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  }

  beforeEach(init);
  afterEach(verifyHttpBackend);

  describe('getAndAddSomething()', function () {
    it('should make a parametrized GET and modify the response', function () {
      this.$httpBackend.expectGET('/example/test').respond({
        name: 'exampleTest'
      });

      this.ExampleService.getAndAddSomething('test')
        .then(function (response) {
          expect(response).toEqual(jasmine.objectContaining({
            name: 'exampleTest',
            something: 'mySomething'
          }));
        });

      this.$httpBackend.flush();
    });

    it('should make a parametrized GET and return empty object on error', function () {
      this.$httpBackend.expectGET('/example/test').respond(500);

      this.ExampleService.getAndAddSomething('test')
        .then(function (response) {
          expect(response).toEqual({});
        });

      this.$httpBackend.flush();
    });
  });
});
