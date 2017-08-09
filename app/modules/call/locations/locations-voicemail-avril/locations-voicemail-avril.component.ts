import { IOption } from 'modules/huron/dialing';

export class LocationsVoicemailAvrilComponent implements ng.IComponentOptions {
  public controller = LocationsVoicemailAvrilComponentCtrl;
  public templateUrl = 'modules/call/locations/locations-voicemail-avril/locations-voicemail-avril.component.html';
  public bindings = {
    externalAccess: '<',
    externalNumber: '<',
    externalNumberOptions: '<',
    changeFn: '&',
    numberFilterFn: '&',
  };
}

class LocationsVoicemailAvrilComponentCtrl implements ng.IComponentController {
  public externalAccess: boolean;
  public externalNumber: string;
  public externalNumberOptions: IOption[];
  private changeFn: Function;
  private numberFilterFn: Function;
  public selectPlaceholder: string;
  public externalNumberModel: IOption | null;
  public missingDirectNumbers: boolean = false;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit(): void {
    this.selectPlaceholder = this.$translate.instant('locations.voicemailFilter');
    this.externalNumberModel = null;

    if (_.isArray(this.externalNumberOptions) && this.externalNumberOptions.length > 0) {
      this.missingDirectNumbers = false;
      if (_.isString(this.externalNumber)) {
        const arrayNumber: IOption[] = this.externalNumberOptions.filter(option => option.value === this.externalNumber);
        if (_.isArray(arrayNumber)) {
          this.externalNumberModel = arrayNumber[0];
        }
      }
    } else {
      this.missingDirectNumbers = true;
    }
  }

  public onNumberFilter(filter: string): void {
    this.numberFilterFn({
      filter: filter,
    });
  }

  public onChange(): void {
    if (!this.externalAccess) {
      this.externalNumberModel = null;
    }
    this.changeFn({
      externalAccess: this.externalAccess,
      externalNumber: this.externalNumberModel !== null ? this.externalNumberModel.value : '',
    });
  }
}
