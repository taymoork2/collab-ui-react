import { MemberType } from 'modules/huron/members';

export class CallFeatureMember {
  public uuid: string;
  public name: string;
  public showName: boolean;
  public number: string;
  public type: MemberType;
  public cardType: CardType | undefined;
  public complexCardType: ComplexCardType | undefined;
  public memberItems?: Array<MemberItem> | undefined;
  public memberItemId?: string | undefined;
  public thumbnailSrc?: string | undefined;

  constructor(obj: {
    uuid: string,
    name: string,
    showName: boolean,
    number: string,
    type: MemberType,
    cardType: CardType | undefined,
    complexCardType: ComplexCardType | undefined,
    memberItems: Array<MemberItem> | undefined,
    memberItemId: string | undefined,
    thumbnailSrc: string | undefined,
  }) {
    this.uuid = obj.uuid;
    this.name = obj.name;
    this.showName = obj.showName;
    this.number = obj.number;
    this.type = obj.type;
    this.cardType = obj.cardType;
    this.complexCardType = obj.complexCardType;
    this.memberItems = obj.memberItems;
    this.memberItemId = obj.memberItemId;
    this.thumbnailSrc = obj.thumbnailSrc;
  }
}

export enum CardType {
  SIMPLE = <any>'simple',
  COMPLEX = <any>'complex',
}

export enum ComplexCardType {
  CHECKBOX = <any>'checkbox',
  RADIO = <any>'radio',
  STATIC = <any>'static',
}

export class MemberItem {
  public label: string;
  public sublabel?: string | null;
  public value?: string | undefined;

  constructor(obj: {
    label: string,
    sublabel: string | undefined | null,
    value: string | undefined,
  }) {
    this.label = obj.label;
    this.sublabel = obj.sublabel;
    this.value = obj.value;
  }
}
