import {
  IRLocation, Location, IRLocationListItem, LocationListItem,
} from './location';

import { IREmergencyNumberData, EmergencyNumber } from 'modules/huron/phoneNumber';

interface ILocationResource extends ng.resource.IResourceClass<ng.resource.IResource<IRLocationListItem>> {}
interface ILocationDetailResource extends ng.resource.IResourceClass<ng.resource.IResource<IRLocation>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

interface IUserLocationDetailResource extends ng.resource.IResourceClass<ng.resource.IResource<IRLocation>> {}

interface IPlaceLocationDetailResource extends ng.resource.IResourceClass<ng.resource.IResource<IRLocation>> {}

interface IUserMoveLocationResource extends ng.resource.IResourceClass<ng.resource.IResource<IRLocation>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

interface IREmergencyNumberResource extends ng.resource.IResourceClass<ng.resource.IResource<IREmergencyNumberData>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

export class LocationsService {
  private locationListResource: ILocationResource;
  private userLocationDetailResource: IUserLocationDetailResource;
  private placeLocationDetailResource: IPlaceLocationDetailResource;
  private userMoveLocationResource: IUserMoveLocationResource;
  private locationDetailResource: ILocationDetailResource;
  private defaultLocation: Location | undefined = undefined;
  private emergencyNumberResource: IREmergencyNumberResource;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $resource: ng.resource.IResourceService,
    private HuronConfig,
    private Authinfo,
  ) {

    const updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };

    const saveAction: ng.resource.IActionDescriptor = {
      method: 'POST',
      headers: {
        'Access-Control-Expose-Headers': 'Location',
      },
    };

    this.locationListResource = <ILocationResource>this.$resource(`${this.HuronConfig.getCmiV2Url()}/customers/:customerId/locations`, {},
      {
        save: saveAction,
      });
    this.userMoveLocationResource = <IUserMoveLocationResource>this.$resource(`${this.HuronConfig.getCmiV2Url()}/customers/:customerId/users/:userId/move/locations`, {},
      {
        update: updateAction,
      });
    this.userLocationDetailResource = <IUserLocationDetailResource>this.$resource(`${this.HuronConfig.getCmiV2Url()}/customers/:customerId/users/:userId`, {}, {});
    this.placeLocationDetailResource = <IPlaceLocationDetailResource>this.$resource(`${this.HuronConfig.getCmiV2Url()}/customers/:customerId/places/:placeId`, {}, {});
    this.locationDetailResource = <ILocationDetailResource>this.$resource(`${this.HuronConfig.getCmiV2Url()}/customers/:customerId/locations/:locationId`, {},
      {
        update: updateAction,
      });

    this.emergencyNumberResource = <IREmergencyNumberResource> this.$resource(`${this.HuronConfig.getCmiV2Url()}/customers/:customerId/locations/:locationId/emergencynumbers/:emergencyNumberId`, {},
      {
        update: updateAction,
        save: saveAction,
      });
  }

  public getLocationList(customerId: string = this.Authinfo.getOrgId()): IPromise<LocationListItem[]> {
    return this.locationListResource.get({
      customerId: customerId,
      wide: true,
    }).$promise.then(locationData => {
      return _.map(_.get<IRLocationListItem[]>(locationData, 'locations', []), location => {
        return new LocationListItem(location);
      });
    }).catch(resp => resp);
  }

  public getLocationsByRoutingPrefix(routingPrefix: string): IPromise<LocationListItem[]> {
    return this.locationListResource.get({
      customerId: this.Authinfo.getOrgId(),
      routingprefix: routingPrefix,
    }).$promise.then(locationData => {
      return _.map(_.get<IRLocationListItem[]>(locationData, 'locations', []), location => {
        return new LocationListItem(location);
      });
    }).catch(resp => resp);
  }

  public getLocation(locationId: string): ng.IPromise<Location> {
    return this.locationDetailResource.get({
      customerId: this.Authinfo.getOrgId(),
      locationId,
    }).$promise
    .then(response => new Location(response));
  }

  public getUserLocation(userId: string): ng.IPromise<Location> {
    return this.userLocationDetailResource.get({
      customerId: this.Authinfo.getOrgId(),
      userId,
    }).$promise
    .then(response => _.get<Location>(response, 'location'));
  }

  public getPlaceLocation(placeId: string): ng.IPromise<Location> {
    return this.placeLocationDetailResource.get({
      customerId: this.Authinfo.getOrgId(),
      placeId,
    }).$promise
    .then(response => _.get<Location>(response, 'location'));
  }

  public getUserOrPlaceLocation(userOrPlaceUuid, userOrPlaceType): ng.IPromise<any> {
    if (userOrPlaceType === 'user') {
      return this.getUserLocation(userOrPlaceUuid);
    } else if (userOrPlaceType === 'place') {
      return this.getPlaceLocation(userOrPlaceUuid);
    } else {
      return this.$q.reject();
    }
  }

  public searchLocations(searchTerm): ng.IPromise<LocationListItem[]> {
    const args = {
      customerId: this.Authinfo.getOrgId(),
      wide: true,
    };

    if (isNaN(searchTerm)) {
      args['name'] = searchTerm;
    } else {
      args['routingprefix'] = searchTerm;
    }

    return this.locationListResource.get(args).$promise.then(locations => {
      return _.map(_.get<IRLocationListItem[]>(locations, 'locations', []), location => {
        return new LocationListItem(location);
      });
    });
  }

  public createLocation(location: Location): ng.IPromise<string> {
    let locationHeader: string;
    return this.locationListResource.save({
      customerId: this.Authinfo.getOrgId(),
    }, {
      name: location.name,
      routingPrefix: location.routingPrefix,
      defaultLocation: location.defaultLocation,
      timeZone: location.timeZone,
      preferredLanguage: location.preferredLanguage,
      tone: location.tone,
      dateFormat: location.dateFormat,
      timeFormat: location.timeFormat,
      steeringDigit: location.steeringDigit,
      allowExternalTransfer: location.allowExternalTransfer,
      voicemailPilotNumber: location.voicemailPilotNumber,
      regionCodeDialing: location.regionCodeDialing,
      callerId: {
        name: _.get(location, 'callerId.name', null),
        number: _.get(location, 'callerId.number', null),
      },
    },
    (_response, headers) => {
      locationHeader = headers('Location');
    }).$promise
    .then(() => locationHeader);
  }

  public updateLocation(location: Location): ng.IPromise<void> {
    return this.locationDetailResource.update({
      customerId: this.Authinfo.getOrgId(),
      locationId: location.uuid,
    }, {
      name: location.name,
      routingPrefix: location.routingPrefix,
      defaultLocation: location.defaultLocation,
      timeZone: location.timeZone,
      preferredLanguage: location.preferredLanguage,
      tone: location.tone,
      dateFormat: location.dateFormat,
      timeFormat: location.timeFormat,
      steeringDigit: location.steeringDigit,
      allowExternalTransfer: location.allowExternalTransfer,
      voicemailPilotNumber: location.voicemailPilotNumber,
      regionCodeDialing: location.regionCodeDialing,
      callerId: {
        name: _.get(location, 'callerId.name', null),
        number: _.get(location, 'callerId.number', null),
      },
    }).$promise;
  }

  public updateUserLocation(userId: string, locationId: string | undefined, validateFlag: boolean): ng.IPromise<void> {
    return this.userMoveLocationResource.update({
      customerId: this.Authinfo.getOrgId(),
      userId,
    }, {
      locationUuid: locationId,
      validate: validateFlag,
    }).$promise.then(() => {
      if ( validateFlag === true) {
        return this.updateUserLocation(userId, locationId, false);
      } else {
        return this.$q.resolve();
      }
    });
  }

  public deleteLocation(locationId: string): ng.IPromise<IRLocation> {
    return this.locationDetailResource.delete({
      customerId: this.Authinfo.getOrgId(),
      locationId: locationId,
    }, location).$promise;
  }

  public getDefaultLocation(customerId: string = this.Authinfo.getOrgId()): ng.IPromise<Location | undefined> {
    if (!this.defaultLocation) {
      return this.getLocationList(customerId).then(locationList => {
        if (_.isArray(locationList) && locationList.length > 0) {
          //First one is always the default per API definition
          return this.getLocation(_.get(locationList[0], 'uuid')).then(location => this.defaultLocation = location);
        } else {
          return this.$q.resolve(undefined);
        }
      });
    } else {
      return this.$q.resolve(this.defaultLocation);
    }
  }

  public makeDefault(locationId: string): ng.IPromise<void> {
    return this.locationDetailResource.update({
      customerId: this.Authinfo.getOrgId(),
      locationId: locationId,
    }, {
      defaultLocation: true,
    }).$promise.then(() => {
      //reset the default location
      this.defaultLocation = undefined;
      this.getDefaultLocation();
    });
  }

  public filterCards(locations: LocationListItem[], filterText: string): LocationListItem[] {
    if (_.isEmpty(filterText)) {
      return locations;
    }
    return _.filter(locations, filteredLocation => {
      return filteredLocation.name.toLowerCase().indexOf(filterText.toLowerCase()) !== -1;
    });
  }

  public hasLocation(name: string): ng.IPromise<boolean> {
    return this.locationListResource.get({
      customerId: this.Authinfo.getOrgId(),
      name: name,
    }).$promise.then(locations => {
      const filterList = _.get<LocationListItem[]>(locations, 'locations', []).filter((item) => {
        return item.name === name;
      });
      return filterList.length > 0;
    });
  }

  public getEmergencyCallbackNumber(locationId: string): ng.IPromise<EmergencyNumber> {
    return this.emergencyNumberResource.get({
      customerId: this.Authinfo.getOrgId(),
      locationId: locationId,
    })
    .$promise
    .then((rEmergencyNumberData: IREmergencyNumberData) => {
      if (_.isArray(rEmergencyNumberData.emergencyNumbers) && rEmergencyNumberData.emergencyNumbers.length > 0) {
        return new EmergencyNumber(rEmergencyNumberData.emergencyNumbers[0]);
      }
      return new EmergencyNumber();
    });
  }

  public createEmergencyCallbackNumber(locationId: string, emergencyNumber: EmergencyNumber): ng.IPromise<string> {
    let location: string;
    return this.emergencyNumberResource.save({
      customerId: this.Authinfo.getOrgId(),
      locationId: locationId,
    },
    emergencyNumber.getREmergencyNumber(),
    (_response, headers) => {
      location = headers('Location');
    })
    .$promise
    .then(() => location);
  }

  public updateEmergencyCallbackNumber(locationId: string, emergencyNumber: EmergencyNumber): ng.IPromise<void> {
    return this.emergencyNumberResource.update({
      customerId: this.Authinfo.getOrgId(),
      locationId: locationId,
      emergencyNumberId: emergencyNumber.uuid,
    }, emergencyNumber.getREmergencyNumber())
    .$promise;
  }

  public deletEmergencyCallbackNumber(locationId: string, emergencyNumber: EmergencyNumber): ng.IPromise<void> {
    return this.emergencyNumberResource.delete({
      customerId: this.Authinfo.getOrgId(),
      locationId: locationId,
      emergencyNumberId: emergencyNumber.uuid,
    })
    .$promise
    .then(() => {});
  }

}
