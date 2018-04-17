import { LocationsService, LocationListItem } from '../shared';
import { Notification } from 'modules/core/notifications';
import { HuronUserService } from 'modules/huron/users';
import { TerminusService } from 'modules/huron/pstn';
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
  public disableLocation: boolean = false;
  public loading: boolean = false;

  /* @ngInject */
  constructor(
    public LocationsService: LocationsService,
    private $state: ng.ui.IStateService,
    private $stateParams: ng.ui.IStateParamsService,
    private Notification: Notification,
    private HuronUserService: HuronUserService,
    private TerminusService: TerminusService,
    private Authinfo,
  ) { }

  public $onInit(): void {
    this.getDetails();
    this.checkNumberE911();
  }

  public checkNumberE911() {
    this.loading = true;
    this.HuronUserService.getUserV2Numbers(this.userId).then(numbers => {
      return _.find(numbers, number => {
        if (!_.isNull(number.external)) {
          return this.TerminusService.customerNumberE911V2().get({
            customerId: this.Authinfo.getOrgId(),
            number: number.external,
          }).$promise.then((e911) => {
            if (e911.useCustomE911Address === false && e911.status === 'PENDING') {
              this.disableLocation = true;
              return true;
            }
          });
        } else {
          return false;
        }
      });
    }).finally(() => this.loading = false);
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
      .catch((error) => {
        _.forEach(error.data.details, detail => {
          switch (detail.productErrorCode) {
            case '19579':
              this.Notification.errorWithTrackingId(error, 'locations.errCode19579');
              break;
            case '19580':
              this.Notification.errorWithTrackingId(error, 'locations.errCode19580');
              break;
            case '19584':
              this.Notification.errorWithTrackingId(error, 'locations.errCode19584');
              break;
          }
        });
      })
      .finally ( () => {
        this.saveInProcess = false;
        this.reset();
      });
  }
}

export class UserLocationDetailsComponent implements ng.IComponentOptions {
  public controller = UserLocationDetailsCtrl;
  public template = require('modules/call/locations/locations-user-details/locations-user-details.component.html');
  public bindings = {
    location: '<',
    locationOptions: '<',
    userId: '<',
    memberType: '@', //MEMBER_TYPE_USER || MEMBER_TYPE_PLACE
  };
}
