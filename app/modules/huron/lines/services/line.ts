export interface ILineLabel {
  value: string;
  appliesToAllSharedLines: boolean;
}

export class LineLabel implements ILineLabel {
  public value: string;
  public appliesToAllSharedLines: boolean;

  constructor(lineLabel: ILineLabel = {
    value: '',
    appliesToAllSharedLines: false,
  }) {
    this.value = lineLabel.value;
    this.appliesToAllSharedLines = lineLabel.appliesToAllSharedLines;
  }
}

export interface ILine {
  uuid?: string;
  primary: boolean;
  shared: boolean;
  internal: string;
  external?: string | null;
  siteToSite: string;
  incomingCallMaximum: number;
  label: LineLabel | null;
}

export class Line implements ILine {
  public uuid: string | undefined;
  public primary: boolean;
  public shared: boolean;
  public internal: string;
  public external: string | null | undefined;
  public siteToSite: string;
  public incomingCallMaximum: number;
  public label: LineLabel | null;

  constructor(line: ILine = {
    uuid: undefined,
    primary: false,
    shared: false,
    internal: '',
    external: null,
    siteToSite: '',
    incomingCallMaximum: 2,
    label: new LineLabel(),
  }) {
    this.uuid = line.uuid;
    this.primary = line.primary;
    this.shared = line.shared;
    this.internal = line.internal;
    this.external = line.external;
    this.siteToSite = line.siteToSite;
    this.incomingCallMaximum = line.incomingCallMaximum;
    this.label = line.label;
  }
}
