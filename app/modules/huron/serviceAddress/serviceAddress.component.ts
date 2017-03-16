class ServiceAddressCtrl implements ng.IComponentController {
  public stateOptions;
  public countryOptions;
  public countryCode: string;
  public stateLabel: string;
  public zipLabel: string;
  public locationModel;
  public address;

  /* @ngInject */
  constructor(private PstnSetupStatesService, private HuronCountryService) { }

  public $onInit() {
    this.locationModel = undefined;
    this.PstnSetupStatesService.getLocation(this.countryCode).then(location => {
      this.zipLabel = location.zip;
      this.stateLabel = location.type;
      if (this.address.state) {
        this.locationModel = location.areas.filter(state => state.abbreviation === this.address.state)[0];
      }
      this.stateOptions = location.areas;
    });

    this.HuronCountryService.getCountryList().then(countries => {
      this.countryOptions = countries;
      this.countryCode = countries.filter(country =>  country.id === this.countryCode )[0];
    });
  }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject}) {
    let { address } = changes;
    if (address && (address.currentValue['state'] === '' || address.currentValue['state'] === undefined)) {
      this.locationModel = undefined;
    }
  }

  public onLocationSelect () {
    this.address.state = this.locationModel.abbreviation;
  }

  public onModify = function () {
    this.locationModel = undefined;
    this.modify();
  };
}

export class HRServiceAddressComponent implements ng.IComponentOptions {
  public controller = ServiceAddressCtrl;
  public templateUrl = 'modules/huron/serviceAddress/serviceAddress.html';
  public bindings = {
    address: '<',
    readOnly: '<',
    hideSearch: '<',
    formName: '<',
    addressValidate: '&',
    modify: '&',
    hideAddress: '<',
    countryCode: '<',
  };
}

export function isolateForm() {
  let directive = {
    restrict: 'A',
    require: '^form',
    link: isolateFormLink,
  };

  return directive;

  function isolateFormLink(scope, elm, attrs, formCtrl) {
    let parentFormCtrl = scope.$eval(attrs.isolateForm) || scope.form;

    if (!formCtrl || !parentFormCtrl) {
      return;
    }

    let formCtlCopy = _.cloneDeep(formCtrl);
    parentFormCtrl.$removeControl(formCtrl);

    // ripped this from an example
    let isolatedFormCtrl = {
      $setValidity: function (validationToken, isValid, control) {
        formCtlCopy.$setValidity(validationToken, isValid, control);
        parentFormCtrl.$setValidity(validationToken, true, formCtrl);
      },
      $setDirty: function () {
        elm.removeClass('ng-pristine').addClass('ng-dirty');
        formCtrl.$dirty = true;
        formCtrl.$pristine = false;
      },
    };
    _.assign(formCtrl, isolatedFormCtrl);

  }
}
