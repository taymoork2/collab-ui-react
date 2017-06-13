import { IToolkitModalService } from 'modules/core/modal';
import { ILocation } from 'modules/call/locations/location';
import { LocationsService } from 'modules/call/locations/locations.service';
import { CardUtils } from 'modules/core/cards';
const STATE_LOADING: string = 'STATE_LOADING';
const STATE_SHOW_LOCATIONS: string = 'STATE_SHOW_LOCATIONS';
const STATE_RELOAD: string = 'STATE_RELOAD';
const STATE_NEW_LOCATION: string = 'STATE_NEW_LOCATION';

class CallLocationsCtrl implements ng.IComponentController {
  public locations: ILocation[] = [];
  public pageState: string = STATE_LOADING;

  /* @ngInject */
  constructor(
    public LocationsService: LocationsService,
    public CardUtils: CardUtils,
    public $state: ng.ui.IStateService,
    public $modal: IToolkitModalService,
    public $q: ng.IQService,
    ) {

  }
  public $onInit(): void {
    this.LocationsService.getLocations().then((result) => {
      this.locations = result;
      if (this.locations.length === 0) {
        this.pageState = STATE_NEW_LOCATION;
      } else {
        this.pageState = STATE_SHOW_LOCATIONS;
      }
      this.reInstantiateMasonry();
    }).catch(() => this.handleFailures());
  }

  public handleFailures(): void {
    this.showReloadPageIfNeeded();
  }

  public showReloadPageIfNeeded(): void {
    if (this.pageState === STATE_LOADING && this.locations.length === 0) {
      this.pageState = STATE_RELOAD;
    }
  }

  /* This function does an in-page search for the string typed in search box*/
  public searchData(searchStr: string): void {
    this.LocationsService.getLocations().then((result) => {
      this.locations = this.LocationsService.filterCards(result, searchStr);
    });
    this.reInstantiateMasonry();
  }

  public reInstantiateMasonry(): void {
    this.CardUtils.resize();
  }

  public reload(): void {
    this.$state.go(this.$state.current, {}, {
      reload: true,
    });
  }

  public copyLocation(location): void {
    this.$modal.open({
      type: 'small',
      template: `<copy-location class="modal-content" uuid="${location.uuid}" style="margin:initial" dismiss="$dismiss()" close="$close()"></copy-location>`,
    }).result.then(() => {
      this.pageState = STATE_LOADING;
      this.$onInit();
    });
  }


  public deleteLocation(location): void {
    this.$modal.open({
      type: 'dialog',
      template: `<delete-location class="modal-content" uuid="${location.uuid}" user-count="${location.userCount}"  place-count="${location.placeCount}" name="${location.name}" style="margin:initial" dismiss="$dismiss()" close="$close()"></delete-location>`,
    }).result.then(() => {
      this.pageState = STATE_LOADING;
      this.$onInit();
    });
  }

  public openModal() {
    this.$state.go('callLocation');
  }

  public makeDefaultLocation(location): void {
    this.$modal.open({
      type: 'dialog',
      template: `<make-default-location class="modal-content" uuid="${location.uuid}" style="margin:initial" dismiss="$dismiss()" close="$close()"></make-default-location>`,
    }).result.then(() => {
      this.pageState = STATE_LOADING;
      this.$onInit();
      this.locations.forEach((location) => {
        location.isDefault = false;
      });
      location.isDefault = true;
    });
  }

}

export class CallLocationsComponent implements ng.IComponentOptions {
  public controller = CallLocationsCtrl;
  public templateUrl = 'modules/call/locations/locations.html';
  public bindings = {};
}
