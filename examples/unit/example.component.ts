import { ExampleService } from './example.service';

class Example implements ng.IComponentController {
  public count: number = 0;

  private error: boolean = false;
  private loading: boolean = false;
  private doneSomething: boolean = false;

  /* @ngInject */
  constructor(
    private ExampleService: ExampleService,
  ) {}

  public incrementCount(): void {
    this.count += 1;
  }

  public doSomething(something): ng.IPromise<any> {
    this.loading = true;
    return this.ExampleService.getAndAddSomething(something)
      .then(() => this.doSomethingElse())
      .catch(() => this.handleError())
      .finally(() => this.doneLoading());
  }

  private doSomethingElse(): void {
    this.doneSomething = true;
  }

  private handleError(): void {
    this.error = true;
  }

  private doneLoading(): void {
    this.loading = false;
  }
}

// This is for example only - this is already dynamically required in atlas modules
// templateUrl can be set to string path to html
// eg. public templateUrl = 'modules/<path>/<to>/<file>.html';
let templateUrl = require('!ngtemplate?module=atlas.templates!raw!./example.html');

export class ExampleComponent implements ng.IComponentOptions {
  public controller = Example;
  public templateUrl = templateUrl;
}
