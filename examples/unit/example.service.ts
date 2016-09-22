export class ExampleService {
  private exampleResource: ng.resource.IResourceClass<ng.resource.IResource<any>>;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService
  ) {
    this.exampleResource = $resource('/example/:id');
  }

  public getAndAddSomething(id): ng.IPromise<any> {
    return this.exampleResource.get({
      id: id,
    }).$promise
      .then(response => this.addSomething(response))
      .catch(response => this.handleError(response));
  }

  public addSomething(obj): any {
    obj.something = 'mySomething';
    return obj;
  }

  private handleError(response): any {
    // Handle error
    return {};
  }
}
