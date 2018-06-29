import {
  PstnAreaService,
  IAreaData,
  IArea,
  Address,
} from 'modules/huron/pstn';

export class HRServiceAddressComponent implements ng.IComponentOptions {
  public controller = ServiceAddressCtrl;
  public template = require('modules/huron/serviceAddress/serviceAddress.html');
  public bindings = {
    address: '<',
    readOnly: '<',
    hideSearch: '<',  //Show or Hide the validate button
    formName: '<',
    addressValidate: '&',  //Must provide if showing the validate button
    modify: '&',
    hideAddress: '<',
    countryCode: '<',
  };
}

class ServiceAddressCtrl implements ng.IComponentController {
  public stateOptions;
  public countryOptions;
  public countryCode: string;
  public stateLabel: string;
  public zipLabel: string;
  public locationModel?: IArea;
  public address: Address;

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
      if (this.address && this.address.state) {
        this.locationModel = location.areas.filter(state => state.abbreviation === this.address.state)[0];
      }
      this.stateOptions = location.areas;
    });

    this.HuronCountryService.getCountryList().then(countries => {
      this.countryOptions = countries;
      this.countryCode = countries.filter(country =>  country.id === this.countryCode )[0];
    });
  }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {
    const { address } = changes;
    if (address) {
      if (address.currentValue) {
        if (address.currentValue['state'] === '' || address.currentValue['state'] === undefined) {
          this.locationModel = undefined;
        }
      } else {
        this.locationModel = undefined;
      }
    }
  }

  public onLocationSelect () {
    if (this.locationModel) {
      this.address.state = this.locationModel.abbreviation;
    }
  }

  public onModify = function () {
    this.locationModel = undefined;
    this.modify();
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
