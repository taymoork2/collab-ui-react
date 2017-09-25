import {
  IRLocation, Location, IRLocationListItem, LocationListItem,
} from './location';

import {
  IRCallPhoneNumberData, IRCallPhoneNumber, CallPhoneNumber,
  IREmergencyNumberData, EmergencyNumber,
} from 'modules/huron/phoneNumber';

interface ILocationResource extends ng.resource.IResourceClass<ng.resource.IResource<IRLocationListItem>> {}
interface ILocationDetailResource extends ng.resource.IResourceClass<ng.resource.IResource<IRLocation>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

interface IUserLocationDetailResource extends ng.resource.IResourceClass<ng.resource.IResource<IRLocation>> {}

interface IUserMoveLocationResource extends ng.resource.IResourceClass<ng.resource.IResource<IRLocation>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

interface INumberResource extends ng.resource.IResourceClass<ng.resource.IResource<IRCallPhoneNumberData>> {}
interface IREmergencyNumberResource extends ng.resource.IResourceClass<ng.resource.IResource<IREmergencyNumberData>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

export class LocationsService {
  private locationListResource: ILocationResource;
  private userLocationDetailResource: IUserLocationDetailResource;
  private userMoveLocationResource: IUserMoveLocationResource;
  private locationDetailResource: ILocationDetailResource;
  private defaultLocation: LocationListItem | undefined = undefined;
  private numberResource: INumberResource;
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
    this.locationDetailResource = <ILocationDetailResource>this.$resource(`${this.HuronConfig.getCmiV2Url()}/customers/:customerId/locations/:locationId`, {},
      {
        update: updateAction,
      });

    this.numberResource = <INumberResource> this.$resource(`${this.HuronConfig.getCmiV2Url()}/customers/:customerId/numbers/:numberId`, {}, {});
    this.emergencyNumberResource = <IREmergencyNumberResource> this.$resource(`${this.HuronConfig.getCmiV2Url()}/customers/:customerId/locations/:locationId/emergencynumbers/:emergencyNumberId`, {},
      {
        update: updateAction,
        save: saveAction,
      });
  }

  public getLocationList(): IPromise<LocationListItem[]> {
    return this.locationListResource.get({
      customerId: this.Authinfo.getOrgId(),
      wide: true,
    }).$promise.then(locations => {
      return _.map(_.get<IRLocationListItem[]>(locations, 'locations', []), location => {
        return new LocationListItem(location);
      });
    });
  }

  public getLocationsByRoutingPrefix(routingPrefix: string): IPromise<LocationListItem[]> {
    return this.locationListResource.get({
      customerId: this.Authinfo.getOrgId(),
      routingprefix: routingPrefix,
    }).$promise.then(locations => {
      return _.map(_.get<IRLocationListItem[]>(locations, 'locations', []), location => {
        return new LocationListItem(location);
      });
    });
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
      callerId: location.callerId,
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
      callerId: location.callerId,
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

  public getDefaultLocation(): ng.IPromise<LocationListItem> {
    if (!this.defaultLocation) {
      return this.getLocationList().then(locationList => {
        //First one is always the default per API definition
        this.defaultLocation = locationList[0];
        return this.defaultLocation;
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

  //return a list of assigned external numbers that are not the Voicemail Pilot number.
  public getEmergencyCallbackNumbersOptions(): ng.IPromise<CallPhoneNumber[]> {
    return this.getDefaultLocation()
    .then(locationListItem => {
      if (locationListItem.uuid) {
        return this.getLocation(locationListItem.uuid);
      }
      return this.$q.reject(); //uuid should always be set in this case
    })
    .then(location => {
      return this.numberResource.get({
        customerId: this.Authinfo.getOrgId(),
        type: 'external',
        assigned: true,
        deprecated: false,
      })
      .$promise
      .then((rNumberData: IRCallPhoneNumberData) => {
        const numbers: CallPhoneNumber[] = [];
        if (_.isArray(rNumberData.numbers)) {
          rNumberData.numbers.forEach((rPhoneNumber: IRCallPhoneNumber) => {
            let number: string = rPhoneNumber.external ? rPhoneNumber.external : '';
            if (number.length > 0) {
              if (number.charAt(0) === '\\') {
                number = number.slice(1);
              }
            }
            if (location.voicemailPilotNumber === null || location.voicemailPilotNumber.number !== number) {
              numbers.push(new CallPhoneNumber(rPhoneNumber));
            }
          });
        }
        return numbers;
      });
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
