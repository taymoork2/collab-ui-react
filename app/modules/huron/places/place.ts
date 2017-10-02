import { PrimaryNumber } from 'modules/huron/primaryLine';
import { IBaseCallNumber } from 'modules/huron/users';

export interface IPlace {
  uuid?: string;
  name?: string;
  displayName?: string;
  sipAddress?: string;
  preferredLanguage?: string;
  allowExternalTransfer: boolean;
  numbers?: IPlaceNumber[];
  primaryNumber?: PrimaryNumber;
}

export interface IPlaceNumber extends IBaseCallNumber {}

export class Place implements IPlace {
  public uuid;
  public name;
  public displayName;
  public sipAddress;
  public preferredLanguage;
  public allowExternalTransfer;
  public numbers;
  public primaryNumber;

  constructor(place: IPlace = {
    uuid: '',
    name: undefined,
    displayName: undefined,
    sipAddress: undefined,
    preferredLanguage: undefined,
    allowExternalTransfer: false,
    numbers: [],
    primaryNumber: undefined,
  }) {
    this.uuid = place.uuid;
    this.name = place.name;
    this.displayName = place.displayName;
    this.sipAddress = place.sipAddress;
    this.preferredLanguage = place.preferredLanguage;
    this.allowExternalTransfer = place.allowExternalTransfer;
    this.numbers = place.numbers;
    this.primaryNumber = place.primaryNumber;
  }
}
