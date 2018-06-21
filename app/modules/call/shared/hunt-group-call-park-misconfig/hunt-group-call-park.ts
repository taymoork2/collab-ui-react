export interface IRInvalidServices {
  huntGroups?: IInvalidService[];
  callParks?: IInvalidService[];
}

export interface IInvalidService {
  uuid: string;
  url: string;
  name: string;
}

export interface IInvalidServices extends IRInvalidServices {}

export class InvalidServices implements IInvalidServices {
  public huntGroups?: IInvalidService[];
  public callParks?: IInvalidService[];

  constructor(invalidServices: IRInvalidServices = {
    huntGroups: [],
    callParks: [],
  }) {
    this.huntGroups = invalidServices.huntGroups;
    this.callParks = invalidServices.callParks;
  }
}
