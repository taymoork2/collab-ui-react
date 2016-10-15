export class Line {
  public uuid: string | undefined;
  public primary: boolean;
  public shared: boolean;
  public internal: string;
  public external: string | null | undefined;
  public siteToSite: string;
  public incomingCallMaximum: number;

  constructor(obj: {
    uuid?: string,
    primary: boolean,
    shared: boolean,
    internal: string,
    external?: string | null,
    siteToSite: string,
    incomingCallMaximum: number,
  } = {
    uuid: undefined,
    primary: false,
    shared: false,
    internal: '',
    external: null,
    siteToSite: '',
    incomingCallMaximum: 2,
  }) {
    this.uuid = obj.uuid;
    this.primary = obj.primary;
    this.shared = obj.shared;
    this.internal = obj.internal;
    this.external = obj.external;
    this.siteToSite = obj.siteToSite;
    this.incomingCallMaximum = obj.incomingCallMaximum;
  }
}
