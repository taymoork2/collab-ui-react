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
  public streetAddress: string | null;
  public unit?: string;
  public city: string | null;
  public state: string | null;
  public zip: string | null;
  public country: string | null;
  public uuid?: string;
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

export class PstnAddressService {
  /* @ngInject */
  constructor (
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
          const tmpAddress: Address = new Address(response.addresses[0]);
          tmpAddress.validated = true;
          if (!_.isString(tmpAddress.country) || tmpAddress.country.length === 0) {
            tmpAddress.country = this.PstnModel.getCountryCode();
          }
          return tmpAddress;
        }
        return null;
      });
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
