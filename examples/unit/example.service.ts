export class ExampleService {
  private exampleResource: ng.resource.IResourceClass<ng.resource.IResource<any>>;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService
  ) {
    this.exampleResource = this.$resource('/example/:id');
  }

  public getAndAddSomething(id): ng.IPromise<any> {
    return this.exampleResource.get({
      id: id,
    }).$promise
      .then(response => this.addSomething(response))
      .catch(() => this.handleError());
  }

  public addSomething(obj): any {
    obj.something = 'mySomething';
    return obj;
  }

  private handleError(): any {
    // Handle error
    return {};
  }
}
