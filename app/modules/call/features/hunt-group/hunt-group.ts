// import { MemberType } from 'modules/huron/members';
import { NumberType } from 'modules/huron/numbers';
import { CallFeatureMember } from 'modules/call/features/shared/call-feature-members/call-feature-member';
import { FallbackDestination } from 'modules/call/features/shared/call-feature-fallback-destination';

export enum HuntMethod {
  DA_LONGEST_IDLE_TIME = <any>'DA_LONGEST_IDLE_TIME',
  DA_BROADCAST = <any>'DA_BROADCAST',
  DA_CIRCULAR = <any>'DA_CIRCULAR',
  DA_TOP_DOWN = <any>'DA_TOP_DOWN',
}

export enum DestinationRule {
  TYPEFALLBACKRULE_FALLBACK_DESTINATION = <any>'TYPEFALLBACKRULE_FALLBACK_DESTINATION',
  TYPEFALLBACKRULE_ALTERNATE_DESTINATION = <any>'TYPEFALLBACKRULE_ALTERNATE_DESTINATION',
  TYPEFALLBACKRULE_AUTOMATIC = <any>'TYPEFALLBACKRULE_AUTOMATIC',
}

export class HuntGroup {
  public uuid: string | undefined;
  public name: string | undefined;
  public huntMethod: HuntMethod | undefined;
  public maxRingSecs: string | undefined;
  public maxWaitMins: string | undefined;
  public sendToApp: boolean;
  public destinationRule: DestinationRule | undefined;
  public fallbackDestination: FallbackDestination;
  public alternateDestination: FallbackDestination;
  public members: CallFeatureMember[];
  public numbers: HuntGroupNumber[];

  constructor(obj: {
    uuid?: string,
    name?: string,
    huntMethod?: HuntMethod,
    maxRingSecs?: string,
    maxWaitMins?: string,
    sendToApp: boolean,
    destinationRule?: DestinationRule,
    fallbackDestination: FallbackDestination,
    alternateDestination: FallbackDestination,
    members: CallFeatureMember[],
    numbers: HuntGroupNumber[],
  } = {
    uuid: undefined,
    name: undefined,
    huntMethod: HuntMethod.DA_LONGEST_IDLE_TIME,
    maxRingSecs: undefined,
    maxWaitMins: undefined,
    sendToApp: true,
    destinationRule: DestinationRule.TYPEFALLBACKRULE_FALLBACK_DESTINATION,
    fallbackDestination: new FallbackDestination(),
    alternateDestination: new FallbackDestination(),
    members: [],
    numbers: [],
  }) {
    this.uuid = obj.uuid;
    this.name = obj.name;
    this.huntMethod = obj.huntMethod;
    this.maxRingSecs = obj.maxRingSecs;
    this.maxWaitMins = obj.maxWaitMins;
    this.sendToApp = obj.sendToApp;
    this.destinationRule = obj.destinationRule;
    this.fallbackDestination = obj.fallbackDestination;
    this.alternateDestination = obj.alternateDestination;
    this.members = obj.members;
    this.numbers = obj.numbers;
  }
}

export class HuntGroupNumber {
  public uuid: string;
  public type: NumberType;
  public number: string;
  public siteToSite: string | undefined;

  constructor (obj: {
    uuid: string,
    type: NumberType,
    number: string,
    siteToSite?: string,
  }) {
    this.uuid = obj.uuid;
    this.type = obj.type;
    this.number = obj.number;
    this.siteToSite = obj.siteToSite;
  }
}

// export class HuntGroupMember {
//   public memberUuid: string;
//   public memberName: string;
//   public memberType: MemberType;
//   public number?: string;
//   public numberUuid?: string;
//   public thumbnailSrc?: string;

//   constructor(obj: {
//     memberUuid: string,
//     memberName: string,
//     memberType: MemberType,
//     number: string | undefined,
//     numberUuid: string | undefined,
//     thumbnailSrc: string | undefined,
//   }) {
//     this.memberUuid = obj.memberUuid;
//     this.memberName = obj.memberName;
//     this.memberType = obj.memberType;
//     this.number = obj.number;
//     this.numberUuid = obj.numberUuid;
//     this.thumbnailSrc = obj.thumbnailSrc;
//   }
// }
