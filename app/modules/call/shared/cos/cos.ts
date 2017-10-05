export interface IRestriction {
  uuid?: string;
  restriction: string;
  blocked: boolean;
}

export interface IRCustomerCos {
  restrictions: IRestriction[];
}

export interface ICustomerCos extends IRCustomerCos {}

export interface IRUserCos {
  user?: IRestriction[];
  place?: IRestriction[];
  customer: IRestriction[];
}

export interface IUserCos extends IRUserCos {}

export interface IRLocationCos {
  location: IRestriction[];
  customer: IRestriction[];
}

export interface ILocationCos extends IRLocationCos {}

export class LocationCos implements ILocationCos {
  public location: IRestriction[];
  public customer: IRestriction[];

  constructor(locationCos: IRLocationCos = {
    location: [],
    customer: [],
  }) {
    this.location = locationCos.location;
    this.customer = locationCos.customer;
  }
}
