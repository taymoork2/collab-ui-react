// TODO: replace this with a TypeScript interface once 'OnboardCtrl' can be revisited
export default class Feature {
  public entitlementState: string;
  public properties = {};

  constructor(
    public entitlementName: string,
    state: boolean,
  ) {
    this.entitlementState = state ? 'ACTIVE' : 'INACTIVE';
  }
}
