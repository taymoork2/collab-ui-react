import { TerminusService } from '../../terminus.service';

export interface IAddressBase {
  city: string;
  state: string;
  zip: string;
  id?: string;
}

export interface IRAddress extends IAddressBase {
  address1: string;
  address2?: string;
}

export interface IAddress extends IAddressBase {
  streetAddress: string;
  unit?: string;
}

export class Address implements IAddress {
  public streetAddress: string;
  public unit?: string;
  public city: string;
  public state: string;
  public zip: string;
  public id?: string;

  constructor(rAddress: IRAddress = {
    address1: '',
    city: '',
    state: '',
    zip: '',
  }) {
    this.id = rAddress.id;
    this.streetAddress = rAddress.address1;
    this.unit = rAddress.address2;
    this.city = rAddress.city;
    this.state = rAddress.state;
    this.zip = rAddress.zip;
  }

  public getRAddress(): IRAddress {
    return {
      address1: this.streetAddress,
      address2: this.unit,
      city: this.city,
      state: this.state,
      zip: this.zip,
    };
  }
}

export class PstnAddressService {
  /* @ngInject */
  constructor (
    private TerminusService: TerminusService,
  ) {}

  //Normally used to validate the address
  public lookup(carrierId: string, address: Address): ng.IPromise<Address | null> {
    return this.TerminusService.carrierE911LookupV2()
      .save({ carrierId: carrierId }, address.getRAddress()) //POST payload to lookup
      .$promise
      .then((response) => {
        if (response && _.isArray(response.addresses) && response.addresses.length > 0) {
          return new Address(response.addresses[0]);
        }
        return null;
      });
  }

  public addToLocation(customerId: string, locationId, address: Address): ng.IPromise<void> {
    return this.TerminusService.customerLocationAddresses()
      .save({ customerId: customerId, locationId: locationId }, address.getRAddress())
      .$promise;
  }

  public updateToLocation(customerId: string, locationId, address: Address): ng.IPromise<void> {
    return this.TerminusService.customerLocationAddresses()
      .update({ customerId: customerId, locationId: locationId, addressId: address.id }, address.getRAddress())
      .$promise;
  }

  public deleteFromLocation(customerId: string, locationId, address: Address): ng.IPromise<void> {
    return this.TerminusService.customerLocationAddresses()
      .delete({ customerId: customerId, locationId: locationId, addressId: address.id })
      .$promise;
  }

  public getByLocation(customerId: string, locationId: string): ng.IPromise<Address[]> {
    return this.TerminusService.customerLocationAddresses()
      .get({ customerId: customerId, locationId: locationId })
      .$promise
      .then(response => {
        const addresses: Address[] = [];
        if (response && _.isArray(response.serviceAddresses) && response.serviceAddresses.length > 0) {
          response.serviceAddresses.forEach(rAddress => {
            addresses.push(new Address(rAddress));
          });
        }
        return addresses;
      });
  }

}
