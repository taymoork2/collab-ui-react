import { LocationsService } from 'modules/call/locations/shared';

export class UniqueLocationDirective implements ng.IDirective {
  constructor(private $q: ng.IQService,
              private $translate: ng.translate.ITranslateService,
              private LocationsService: LocationsService) {

  }

  public restrict: string = 'A';
  public require: string = 'ngModel';
  public link: ng.IDirectiveLinkFn = (scope, _elm, attrs, ngModelCtrl: ng.INgModelController) => {
    const messages = scope.$eval(attrs.messages);
    ngModelCtrl.$asyncValidators.uniqueAsyncValidator = (modelValue) => {
      // consider empty model valid
      if (ngModelCtrl.$isEmpty(modelValue)) {
        return this.$q.resolve();
      }

      // non-dirty element is valid
      if (!ngModelCtrl.$dirty) {
        return this.$q.resolve();
      }

      return this.$q((resolve, reject) => {
        this.validateField(modelValue).then((result) => {
          if (result.valid) {
            resolve();
          } else {
            messages.uniqueAsyncValidator = this.$translate.instant(result.error);
            reject();
          }
        });
      });
    };
  }

  public  validateField(modelValue: string): ng.IPromise<{valid, error?}> {
    return this.LocationsService.hasLocation(modelValue).then((response) => {
      if (!response) {
        return { valid: true };
      }
      return { valid: false, error: 'locations.usedLocation' };
    });
  }

  /* @ngInject */
  public static factory($q, $translate, LocationsService) {
    return new UniqueLocationDirective($q, $translate, LocationsService);
  }
}
