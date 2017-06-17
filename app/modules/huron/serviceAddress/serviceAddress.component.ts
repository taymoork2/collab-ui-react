import {
  PstnAreaService,
  IAreaData,
} from 'modules/huron/pstn';

class ServiceAddressCtrl implements ng.IComponentController {
  public stateOptions;
  public countryOptions;
  public countryCode: string;
  public stateLabel: string;
  public zipLabel: string;
  public locationModel;
  public address;

  /* @ngInject */
  constructor(
    private PstnAreaService: PstnAreaService,
    private HuronCountryService,
  ) { }

  public $onInit() {
    this.locationModel = undefined;
    this.PstnAreaService.getCountryAreas(this.countryCode).then( (location: IAreaData) => {
      this.zipLabel = location.zipName;
      this.stateLabel = location.typeName;
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
    const { address } = changes;
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
  const directive = {
    restrict: 'A',
    require: '^form',
    link: isolateFormLink,
  };

  return directive;

  function isolateFormLink(scope, elm, attrs, formCtrl) {
    const parentFormCtrl = scope.$eval(attrs.isolateForm) || formCtrl.$$parentForm || scope.form;

    if (!formCtrl || !parentFormCtrl) {
      return;
    }

    const formCtlCopy = _.cloneDeep(formCtrl);
    parentFormCtrl.$removeControl(formCtrl);

    // ripped this from an example
    const isolatedFormCtrl = {
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
