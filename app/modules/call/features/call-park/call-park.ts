import { CallFeatureMember } from 'modules/call/features/shared/call-feature-members/call-feature-member';
import { FallbackDestination } from 'modules/call/features/shared/call-feature-fallback-destination';
import { LocationListItem } from 'modules/call/locations';

const FALLBACK_TIMER_DEFAULT: number = 120;

export class CallPark {
  public uuid: string | undefined;
  public name: string | undefined;
  public startRange: string | undefined;
  public endRange: string | undefined;
  public fallbackDestination: FallbackDestination;
  public fallbackTimer: number;
  public members: CallFeatureMember[];
  public location: LocationListItem | undefined;

  constructor(obj: {
    uuid?: string,
    name?: string,
    startRange?: string,
    endRange?: string,
    fallbackDestination: FallbackDestination,
    fallbackTimer: number,
    members: CallFeatureMember[],
    location?: LocationListItem,
  } = {
    uuid: undefined,
    name: undefined,
    startRange: undefined,
    endRange: undefined,
    fallbackDestination: new FallbackDestination(),
    fallbackTimer: FALLBACK_TIMER_DEFAULT,
    members: [],
    location: undefined,
  }) {
    this.uuid = obj.uuid;
    this.name = obj.name;
    this.startRange = obj.startRange;
    this.endRange = obj.endRange;
    this.fallbackDestination = obj.fallbackDestination;
    this.fallbackTimer = obj.fallbackTimer;
    this.members = obj.members;
    this.location = obj.location;
  }
}
