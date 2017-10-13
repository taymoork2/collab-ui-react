export class Place {
  constructor(obj = {
    directoryNumber: undefined,
    entitlements: undefined,
    externalNumber: undefined,
    name: undefined,
    machineType: undefined,
  }) {
    this.directoryNumber = obj.directoryNumber;
    this.entitlements = obj.entitlements;
    this.externalNumber = obj.externalNumber;
    this.name = obj.name;
    this.machineType = obj.machineType;
  }
}
