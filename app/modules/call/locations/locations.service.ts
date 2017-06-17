import { ILocation, Location } from 'modules/call/locations/location';

interface ILocationsResource extends ng.resource.IResourceClass<ng.resource.IResource<ILocation>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<ILocation>>;
}

export class LocationsService {
  private locationsService: ILocationsResource;
  public locations: ILocation[] = [{
    uuid: '123',
    name: 'Home Office',
    routingPrefix: '8100',
    defaultLocation: true,
    userCount: 10,
    placeCount: 3,
    url: 'http://something/123',
  },
  {
    uuid: '456',
    name: 'Desk Phone',
    routingPrefix: '8100',
    defaultLocation: false,
    userCount: 10,
    placeCount: 3,
    url: 'http://something/456',
  }];
  /* @ngInject */
  constructor(private $q: ng.IQService,
              private $resource: ng.resource.IResourceService,
              private HuronConfig,
             // private Authinfo,
  ) {
    const updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };
    this.locationsService = <ILocationsResource>this.$resource(`${this.HuronConfig.getCmiV2Url()}/customers/:customerId/locations/:locationId`, {},
      {
        update: updateAction,
      });

  }
  //TODO: remove comments and use actual APIs when  API is availble
  public getLocations(): IPromise<Location[]> {
    // return this.locationsService.query({
    //   customerId: this.Authinfo.getOrgId(),
    // }).$promise;
    return this.$q.resolve(this.locations);
    // return this.$q.reject();
  }

  public filterCards(locations: ILocation[], filterText: string): ILocation[] {
    if (_.isEmpty(filterText)) {
      return locations;
    }
    let filteredLocations: ILocation[] = [];
    filteredLocations = _.filter(locations, function(someObject) {
      return someObject.name.toLowerCase().indexOf(filterText.toLowerCase()) !== -1;
    });
    return filteredLocations;
  }

  public getLocationDetails(locationId) {
    // return this.locationsService.get({
    //   customerId: this.Authinfo.getOrgId(),
    //   locationId,
    // }).$promise;
    return this.$q.resolve({
      uuid: locationId,
      name: 'Home Office',
      timezone: 'CST',
      userCount: 0,
      placeCount: 0,
      preferredLanguage: 'USEnglish',
    });
  }

  public createLocation(location): ng.IPromise<Location> {
    // return this.locationsService.save({
    //   customerId: this.Authinfo.getOrgId(),
    // }, location).$promise;
    this.locations.push(location);
    return this.$q.resolve(location);
  }

  public deleteLocation(locationId): ng.IPromise<any> {
    // return this.locationsService.delete({
    //   customerId: this.Authinfo.getOrgId(),
    //   locationId,
    // }).$promise;
    const index = _.findIndex(this.locations, location =>  location.uuid === locationId);

    this.locations.splice(index, 1);
    return this.$q.resolve(location);
  }

  public hasLocation(name: string): ng.IPromise<boolean> {
    if (name === 'Home Office') {
      return this.$q.resolve(true);
    }
    return this.$q.resolve(false);
  }

  public updateLocation(locationId: string, params: Object) {
    // return this.locationsService.update({
    //   locationId
    // }, params).$promise;
    return this.$q.resolve({
      locationId,
      params,
    });
  }
}
