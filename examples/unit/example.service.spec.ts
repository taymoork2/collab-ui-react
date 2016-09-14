import exampleModule from './index';

describe('Service: ExampleService', () => {
  beforeEach(function () {
    this.initModules(exampleModule);
    this.injectDependencies(
      '$httpBackend',
      'ExampleService'
    );
  });
  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('getAndAddSomething()', () => {
    it('should make a parametrized GET and modify the response', function () {
      this.$httpBackend.expectGET('/example/test').respond({
        name: 'exampleTest',
      });

      this.ExampleService.getAndAddSomething('test')
        .then((response) => {
          expect(response).toEqual(jasmine.objectContaining({
            name: 'exampleTest',
            something: 'mySomething',
          }));
        });

      this.$httpBackend.flush();
    });

    it('should make a parametrized GET and return empty object on error', function () {
      this.$httpBackend.expectGET('/example/test').respond(500);

      this.ExampleService.getAndAddSomething('test')
        .then((response) => {
          expect(response).toEqual({});
        });

      this.$httpBackend.flush();
    });
  });
});
