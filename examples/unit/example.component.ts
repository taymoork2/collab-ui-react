import { ExampleService } from './example.service';

class Example implements ng.IComponentController {
  public count: number = 0;

  public error: boolean = false;
  public loading: boolean = false;
  public doneSomething: boolean = false;

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

export class ExampleComponent implements ng.IComponentOptions {
  public controller = Example;
  public template = require('./example.html');
}
