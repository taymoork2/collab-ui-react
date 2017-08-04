export interface IRInternalNumberRange {
  uuid?: string;
  name?: string;
  beginNumber: string;
  endNumber: string;
}

export interface IInternalNumberRange extends IRInternalNumberRange {}

export class InternalNumberRange implements IInternalNumberRange {
  public uuid?: string;
  public name?: string;
  public beginNumber: string;
  public endNumber: string;

  constructor(internalNumberRange: IRInternalNumberRange = {
    uuid: undefined,
    name: undefined,
    beginNumber: '',
    endNumber: '',
  }) {
    this.uuid = internalNumberRange.uuid;
    this.name = internalNumberRange.name;
    this.beginNumber = internalNumberRange.beginNumber;
    this.endNumber = internalNumberRange.endNumber;
  }
}
