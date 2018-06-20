export interface IOption {
  value: string;
  label: string;
  isSelected: boolean;
}

export class Destination {
  public address: string;
  public name: string;
  constructor(obj: {
    address: string,
    name: string,
  } = {
    address: '',
    name: '',
  }) {
    this.address = obj.address;
    this.name = obj.name;
  }
}

export class PrivateTrunkResource {
  public destinations: Destination[];
  public hybridDestination: Destination;
  constructor(obj: {
    destinations: Destination[],
    hybridDestination: Destination,
  } = {
    destinations: [],
    hybridDestination: new Destination(),
  }) {
    this.destinations = obj.destinations;
    this.hybridDestination = obj.hybridDestination;
  }
}
