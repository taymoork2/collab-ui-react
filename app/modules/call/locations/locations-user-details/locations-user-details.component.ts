import {
  LocationsService, LocationListItem,
} from '../shared';

import { Notification } from 'modules/core/notifications';
export const MEMBER_TYPE_USER: string = 'user';
export const MEMBER_TYPE_PLACE: string = 'place';

class UserLocationDetailsCtrl implements ng.IComponentController {
  private form: ng.IFormController;
  public userId: string;
  public locationOptions: LocationListItem[] = [];
  public selectedLocation: LocationListItem;
  public locationName: string;
  public locationId: string | undefined;
  public saveInProcess: boolean;
  public memberType: string;
  public validateFlag: boolean;

  /* @ngInject */
  constructor(
    public LocationsService: LocationsService,
    private $state: ng.ui.IStateService,
    private $stateParams: ng.ui.IStateParamsService,
    private Notification: Notification,

  ) { }

  public $onInit(): void {
    this.getDetails();
  }

  public getDetails(): void {
    this.loadLocations();
    this.getUserLocation();
  }

  public loadLocations(): void {
    this.LocationsService.getLocationList().then(result => {
      this.locationOptions = result;
    });
  }

  public getUserLocation(): void {
    this.LocationsService.getUserLocation(this.userId).then(result => {
      this.selectedLocation = result;
    });
  }

  public reset(): void {
    this.getDetails();
    this.saveInProcess = false;
    this.form.$setPristine();
    this.form.$setUntouched();
  }

  public onLocationChange(): void {
    this.locationId = this.selectedLocation.uuid;
  }

  public save(): void {
    this.saveInProcess = true;
    this.LocationsService.updateUserLocation(this.userId, this.locationId, true)
      .then(() => {
        if (this.$stateParams.memberType === MEMBER_TYPE_USER) {
          this.$state.go('user-overview', { userLocation : this.selectedLocation.name }, { reload: true });
        } else if (this.$stateParams.memberType === MEMBER_TYPE_PLACE) {
          this.$state.go('place-overview', { placeLocation : this.selectedLocation.name }, { reload: true });
        }
      })
      .catch(() => {
        this.Notification.error('locations.userLocMoveErrorDesc');
      })
      .finally ( () => {
        this.saveInProcess = false;
        this.reset();
      });
  }
}

export class UserLocationDetailsComponent implements ng.IComponentOptions {
  public controller = UserLocationDetailsCtrl;
  public templateUrl = 'modules/call/locations/locations-user-details/locations-user-details.component.html';
  public bindings = {
    location: '<',
    locationOptions: '<',
    userId: '<',
    memberType: '@', //MEMBER_TYPE_USER || MEMBER_TYPE_PLACE
  };
}
