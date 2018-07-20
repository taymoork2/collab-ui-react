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
      const sparkBotPromise = this.SparkService.getPersonByEmail(`${$viewValue}@sparkbot.io`);
      const webexBotPromise = this.SparkService.getPersonByEmail(`${$viewValue}@webex.bot`);
      return this.$q.all([sparkBotPromise, webexBotPromise]).then((existingEmails) => {
        // promise.all returns [ {sparkEmails}, {webexEmails} ]
        const [sparkEmails, webexBotEmails] = existingEmails;
        const sparkBotEmailCount = _.get(sparkEmails, 'items.length', 0);
        const webexBotEmailCount = _.get(webexBotEmails, 'items.length', 0);
        if (sparkBotEmailCount === 0 &&  webexBotEmailCount === 0) {
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
