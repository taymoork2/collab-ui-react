export class PrimaryNumber {
  public alwaysUseForOutboundCalls: boolean;

  constructor(obj: {
    alwaysUseForOutboundCalls: boolean,
  }) {
    this.alwaysUseForOutboundCalls = obj.alwaysUseForOutboundCalls;
  }
}
