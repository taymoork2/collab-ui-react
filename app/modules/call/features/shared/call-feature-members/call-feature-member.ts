import { MemberType } from 'modules/huron/members';

export interface ICallFeatureMember {
  uuid: string;
  name: string;
  showName: boolean;
  number: string;
  type: MemberType;
  cardType: CardType;
  complexCardType?: ComplexCardType;
  memberItems?: MemberItem[];
  memberItemId?: string;
  thumbnailSrc?: string;
}

export class CallFeatureMember implements ICallFeatureMember {
  public uuid: string;
  public name: string;
  public showName: boolean;
  public number: string;
  public type: MemberType;
  public cardType: CardType;
  public complexCardType?: ComplexCardType;
  public memberItems?: MemberItem[];
  public memberItemId?: string;
  public thumbnailSrc?: string;

  constructor(callFeatureMember: ICallFeatureMember = {
    uuid: '',
    name: '',
    showName: true,
    number: '',
    type: MemberType.USER_REAL_USER,
    cardType: CardType.SIMPLE,
    complexCardType: undefined,
    memberItems: undefined,
    memberItemId: undefined,
    thumbnailSrc: undefined,
  }) {
    this.uuid = callFeatureMember.uuid;
    this.name = callFeatureMember.name;
    this.showName = callFeatureMember.showName;
    this.number = callFeatureMember.number;
    this.type = callFeatureMember.type;
    this.cardType = callFeatureMember.cardType;
    this.complexCardType = callFeatureMember.complexCardType;
    this.memberItems = callFeatureMember.memberItems;
    this.memberItemId = callFeatureMember.memberItemId;
    this.thumbnailSrc = callFeatureMember.thumbnailSrc;
  }
}

export enum CardType {
  SIMPLE = 'simple',
  COMPLEX = 'complex',
}

export enum ComplexCardType {
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  STATIC = 'static',
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
