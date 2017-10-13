import { LocationsService } from 'modules/call/locations/shared';
import { Location, LocationListItem } from 'modules/call/locations/shared';

class CallFeatureLocationCtrl implements ng.IComponentController {
  public static readonly DISPLAYED_MEMBER_SIZE: number = 10;

  public location;
  public locationUuid;
  public searchLocation;
  public locationHint: string;
  public removeKey: string;
  public isNew: boolean;
  public onChangeFn: Function;
  public onKeyPressFn: Function;
  public errorLocationInput: boolean = false;
  public searchStr: string;
  public callFeatureType: string;
  public featureType: string;
  public hasLocation: boolean = false;
  public customerLocations;

  /* @ngInject */
  constructor(
    private LocationsService: LocationsService,
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit(): void {
    this.featureType = this.$translate.instant(this.callFeatureType);
    if (!this.isNew) {
      this.LocationsService.getLocationList().then(locations => this.customerLocations = locations);
    }
  }

  public searchLocations(searchStr: string): ng.IPromise<LocationListItem[]> {
    return this.LocationsService.searchLocations(searchStr).then((locations) => locations);
  }

  public selectLocation(location: Location): void {
    this.searchLocation = undefined;
    this.location = location;
    this.onLocationChanged(this.location);
  }

  public removeLocation(): void {
    this.location = undefined;
    this.onLocationChanged(this.location);
  }

  private onLocationChanged(location: Location): void {
    this.onChangeFn({
      location: _.cloneDeep(location),
    });
  }

  public onHandleKeyPress($keyCode): void {
    this.onKeyPressFn({
      keyCode: $keyCode,
    });
  }
}

export class CallFeatureLocationComponent implements ng.IComponentOptions {
  public controller = CallFeatureLocationCtrl;
  public template = require('modules/call/features/shared/call-feature-location/call-feature-location.component.html');
  public bindings = {
    isNew: '<',
    onChangeFn: '&',
    onKeyPressFn: '&',
    location: '<',
    callFeatureType: '@',
  };
}
