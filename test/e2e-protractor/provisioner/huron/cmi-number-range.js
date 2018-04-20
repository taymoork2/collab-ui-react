export class CmiNumberRange {
  constructor(obj = {
    beginNumber: undefined,
    endNumber: undefined,
    description: undefined,
    name: undefined,
    patternUsage: undefined,
  }) {
    this.beginNumber = obj.beginNumber || '300';
    this.endNumber = obj.endNumber || '399';
    this.description = obj.description || this.beginNumber + ' - ' + this.endNumber;
    this.name = obj.name || this.beginNumber + ' - ' + this.endNumber;
    this.patternUsage = obj.patternUsage || 'Device';
  }
}
