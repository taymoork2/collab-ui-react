import { TerminusService } from '../../terminus.service';
import { PstnModel } from '../../pstn.model';

export interface IAddressBase {
  city: string | null;
  zip: string | null;
  country: string | null;
  uuid?: string;
  default: boolean;
}

export interface IRAddress extends IAddressBase {
  address1: string | null;
  address2?: string;
  stateOrProvinceOrRegion: string | null;
}

export interface IAddress extends IAddressBase {
  streetAddress: string | null;
  unit?: string;
  state: string | null;
  validated: boolean;
}

export class Address implements IAddress {
  public uuid?: string;
  public streetAddress: string | null;
  public unit?: string;
  public city: string | null;
  public state: string | null;
  public zip: string | null;
  public country: string | null;
  public validated: boolean = false;
  public default: boolean;

  constructor(rAddress: IRAddress = {
    address1: null,
    city: null,
    stateOrProvinceOrRegion: null,
    zip: null,
    country: null,
    default: false,
  }) {
    this.uuid = rAddress.uuid;
    this.streetAddress = rAddress.address1;
    this.unit = rAddress.address2;
    this.city = rAddress.city;
    this.state = rAddress.stateOrProvinceOrRegion;
    this.zip = rAddress.zip;
    this.country = rAddress.country;
    this.default = rAddress.default;
  }

  public getRAddress(): IRAddress {
    return {
      address1: this.streetAddress,
      address2: this.unit,
      city: this.city,
      stateOrProvinceOrRegion: this.state,
      zip: this.zip,
      country: this.country,
      default: this.default,
    };
  }

  public reset (): void {
    this.uuid = undefined;
    this.streetAddress = null;
    this.unit = undefined;
    this.city = null;
    this.state = null;
    this.zip = null;
    this.country = null;
    this.default = false;
    this.validated = false;
  }
}
const LOCATION_HEADER = 'Location';

interface IServiceAddress {
  serviceName: string;
  serviceStreetNumber: string;
  serviceStreetDirection: string;
  serviceStreetName: string;
  serviceStreetSuffix: string;
  serviceAddressSub: string;
  serviceCity: string;
  serviceState: string;
  serviceZip: string;
}

interface IRSite {
  uuid?: string;
  name: string;
  url: string;
  serviceAddress?: IServiceAddress;
}

export class PstnAddressService {
  /* @ngInject */
  constructor (
    private $q: ng.IQService,
    private PstnModel: PstnModel,
    private TerminusService: TerminusService,
  ) {}

  //Normally used to validate the address
  public lookup(carrierId: string, address: Address): ng.IPromise<Address | null> {
    return this.TerminusService.carrierE911LookupV2()
      .save({ carrierId: carrierId }, address.getRAddress()) //POST payload to lookup
      .$promise
      .then((response) => {
        if (response && _.isArray(response.addresses) && response.addresses.length > 0) {
          const address: Address = new Address(response.addresses[0]);
          address.validated = true;
          if (!_.isString(address.country) || address.country.length === 0) {
            address.country = this.PstnModel.getCountryCode();
          }
          return address;
        }
        return null;
      });
  }

  private getAddressFromServiceAddress(serviceAddress: IServiceAddress | undefined): Address {
    const address: Address = new Address();
    if (!serviceAddress) {
      return address;
    }
    const streetName: string = _.isEmpty(serviceAddress.serviceStreetDirection) ? serviceAddress.serviceStreetName : `${serviceAddress.serviceStreetDirection} ${serviceAddress.serviceStreetName}`;
    const streetAddress: string = `${serviceAddress.serviceStreetNumber} ${streetName} ${serviceAddress.serviceStreetSuffix}`;
    address.streetAddress = streetAddress;
    address.unit = serviceAddress.serviceAddressSub;
    address.city = serviceAddress.serviceCity;
    address.state = serviceAddress.serviceState;
    address.zip = serviceAddress.serviceZip;
    address.country = this.PstnModel.getCountryCode();
    return address;
  }

  public getBySite(customerId: string): ng.IPromise<Address> {
    //Currently only one site per customer.
    return this.TerminusService.customerSite<IRSite>()
      .query({ customerId: customerId })
      .$promise
      .then((minSites: IRSite[]) => {
        if (_.isArray(minSites) && minSites.length > 0) {
          const promises: ng.IPromise<IRSite>[] = [];
          for (let i: number = 0; i < minSites.length; i++ ) {
            promises.push(this.TerminusService.customerSite<IRSite>()
              .get({ customerId: customerId, siteId: minSites[i].uuid })
              .$promise);
          }
          return this.$q.all(promises).then((sites: IRSite[]) => {
            const address: Address = this.getAddressFromServiceAddress(sites[0].serviceAddress);
            address.validated = true;
            return address;
          });
        }
        return new Address; //The addess is set to invalid by default
      });
  }

  private getServiceAddressFromAddress(address: Address, name: string): IServiceAddress {
    const streetAddressArray = address.streetAddress ? address.streetAddress.split(/\s+/) : [''];
    const serviceAddress: IServiceAddress = {
      serviceName: name,
      serviceStreetNumber: _.head(streetAddressArray),
      serviceStreetDirection: '',
      serviceStreetName: _.tail(streetAddressArray).join(' '),
      serviceStreetSuffix: '',
      serviceAddressSub: address.unit ? address.unit : '',
      serviceCity: address.city ? address.city : '',
      serviceState: address.state ? address.state : '',
      serviceZip: address.zip ? address.zip : '',
    };
    return serviceAddress;
  }

  public createBySite(customerId: string, name: string, address: Address): ng.IPromise<string> {
    let siteId: string = '';
    const payload = {
      name: name,
      serviceAddress: this.getServiceAddressFromAddress(address, name),
    };
    return this.TerminusService.customerSite<void>()
      .save({ customerId: customerId }, payload, (_response, headers) => {
        const locationHeader = headers(LOCATION_HEADER);
        if (!_.isEmpty(locationHeader)) {
          siteId = _.last(locationHeader.split('/'));
        }
      }).$promise
      .then(() => siteId);
  }

  public addToLocation(customerId: string, locationId: string, address: Address): ng.IPromise<void> {
    return this.TerminusService.customerLocationAddresses<void>()
      .save({ customerId: customerId, locationId: locationId }, address.getRAddress())
      .$promise;
  }

  public updateToLocation(customerId: string, locationId: string, address: Address): ng.IPromise<void> {
    return this.TerminusService.customerLocationAddresses<void>()
      .update({ customerId: customerId, locationId: locationId, addressId: address.uuid }, address.getRAddress())
      .$promise;
  }

  public deleteFromLocation(customerId: string, locationId: string, address: Address): ng.IPromise<void> {
    return this.TerminusService.customerLocationAddresses<void>()
      .delete({ customerId: customerId, locationId: locationId, addressId: address.uuid })
      .$promise;
  }

  public getByLocation(customerId: string, locationId: string): ng.IPromise<Address[]> {
    return this.TerminusService.customerLocationAddresses<IRAddress>()
      .query({ customerId: customerId, locationId: locationId })
      .$promise
      .then(rAddresses => _.map(rAddresses, rAddress => {
        const address: Address = new Address(rAddress);
        address.validated = true;
        return address;
      }));
  }

}
