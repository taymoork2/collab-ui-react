export class LineLabel {
  public value: string;
  public appliesToAllSharedLines: boolean;

  constructor(obj: {
    value: string,
    appliesToAllSharedLines: boolean,
  } = {
    value: '',
    appliesToAllSharedLines: false,
  }) {
    this.value = obj.value;
    this.appliesToAllSharedLines = obj.appliesToAllSharedLines;
  }
}

export class Line {
  public uuid: string | undefined;
  public primary: boolean;
  public shared: boolean;
  public internal: string;
  public external: string | null | undefined;
  public siteToSite: string;
  public incomingCallMaximum: number;
  public label: LineLabel | null;

  constructor(obj: {
    uuid?: string,
    primary: boolean,
    shared: boolean,
    internal: string,
    external?: string | null,
    siteToSite: string,
    incomingCallMaximum: number,
    label: LineLabel | null,
  } = {
    uuid: undefined,
    primary: false,
    shared: false,
    internal: '',
    external: null,
    siteToSite: '',
    incomingCallMaximum: 2,
    label: new LineLabel(),
  }) {
    this.uuid = obj.uuid;
    this.primary = obj.primary;
    this.shared = obj.shared;
    this.internal = obj.internal;
    this.external = obj.external;
    this.siteToSite = obj.siteToSite;
    this.incomingCallMaximum = obj.incomingCallMaximum;
    this.label = obj.label;
  }
}
