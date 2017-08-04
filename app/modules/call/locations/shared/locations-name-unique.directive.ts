import { LocationsService, CallLocationSettingsService } from 'modules/call/locations/shared';

export class UniqueLocationDirective implements ng.IDirective {
  constructor(
    private $q: ng.IQService,
    private LocationsService: LocationsService,
    private CallLocationSettingsService: CallLocationSettingsService,
  ) {}

  public restrict: string = 'A';
  public require: string = 'ngModel';
  public link: ng.IDirectiveLinkFn = (
    _scope: ng.IScope,
    _element: ng.IAugmentedJQuery,
    _attrs: ng.IAttributes,
    ctrl: ng.INgModelController,
  ) => {
    ctrl.$asyncValidators.uniqueAsyncValidator = (modelValue) => {
      // consider empty model valid
      if (ctrl.$isEmpty(modelValue)) {
        return this.$q.resolve();
      }

      // non-dirty element is valid
      if (!ctrl.$dirty) {
        return this.$q.resolve();
      }

      const existingLocationConfig = this.CallLocationSettingsService.getOriginalConfig();
      if (existingLocationConfig && existingLocationConfig.location.name === modelValue) {
        return this.$q.resolve();
      }

      return this.LocationsService.hasLocation(modelValue)
        .then(locationExists => {
          if (locationExists) {
            return this.$q.reject();
          } else {
            return this.$q.resolve();
          }
        });
    };
  }

  /* @ngInject */
  public static factory($q, LocationsService, CallLocationSettingsService) {
    return new UniqueLocationDirective($q, LocationsService, CallLocationSettingsService);
  }
}
