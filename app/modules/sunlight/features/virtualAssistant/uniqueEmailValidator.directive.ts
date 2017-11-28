import { SparkService } from './services/sparkService';

export class UniqueEmailValidator implements ng.IDirective {
  constructor(
    private $q: ng.IQService,
    private SparkService: SparkService,
  ) {}

  public restrict: string = 'A';
  public require: string = 'ngModel';
  public link: ng.IDirectiveLinkFn = (
    _scope: ng.IScope,
    _element: ng.IAugmentedJQuery,
    _attrs: ng.IAttributes,
    ctrl: ng.INgModelController,
  ) => {
    ctrl.$asyncValidators.uniqueEmailValidator = ($viewValue) => {
      // consider empty model valid
      if (ctrl.$isEmpty($viewValue)) {
        return this.$q.resolve();
      }
      return this.SparkService.getPersonByEmail(`${$viewValue}@sparkbot.io`).then((existingEmails) => {
        if (_.get(existingEmails, 'items.length', 0) === 0) {
          return this.$q.resolve();
        }
        return this.$q.reject();
      });
    };
  }

  /* @ngInject */
  public static factory($q, SparkService) {
    return new UniqueEmailValidator($q, SparkService);
  }
}
