import { LocationsService } from 'modules/call/locations/locations.service';

export class UniqueLocationDirective implements ng.IDirective {
  constructor(private $q: ng.IQService,
              private $translate: ng.translate.ITranslateService,
              private LocationsService: LocationsService) {

  }

  public restrict: string = 'A';
  public require: string = 'ngModel';
  public link: ng.IDirectiveLinkFn = (scope, _elm, attrs, ngModelCtrl: ng.INgModelController) => {
    let messages = scope.$eval(attrs.messages);
    ngModelCtrl.$asyncValidators.uniqueAsyncValidator = (_modelValue, viewValue) => {
      return this.$q((resolve, reject) => {
        this.validateField(viewValue).then((result) => {
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

  public  validateField(viewValue: string): ng.IPromise<{valid, error?}> {
    return this.LocationsService.hasLocation(viewValue).then((response) => {
      if (!response) {
        return { valid: true };
      }
      return { valid: false, error: this.$translate.instant('locations.usedLocation') };
    });
  }

  /* @ngInject */
  public static factory($q, $translate, LocationsService) {
    return new UniqueLocationDirective($q, $translate, LocationsService);
  }
}
