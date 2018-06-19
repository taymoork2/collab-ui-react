declare namespace csdm {

  interface IDevice extends IDevicePlaceCommon {
    isATA: boolean;
    ip: string;
    mac: string;
    serial: string;
    isOnline: boolean;
    canReset: boolean;
    canDelete: boolean;
    canReportProblem: boolean;
    supportsCustomTags: boolean;
    hasRemoteSupport: boolean;
    state: { key: string, readableState: string };
    cssColorClass: string;
    photos: string[];
    product: string;
    productFamily: string;
    diagnosticsEvents: IDeviceDiagnosticEvent[];
    upgradeChannel: IDeviceUpgradeChannel;
    hasIssues: boolean;
    software: string;
    readableActiveInterface: string;
	wdmUrl?: string;
    isHuronDevice2(): this is IHuronDevice;
    isCloudberryDevice2(): this is ICloudBerryDevice;
  }

  interface IHuronDevice extends IDevice {
    huronId: string;
    addOnModuleCount: number;
  }

  interface ICloudBerryDevice extends IDevice {
  }

  interface IBasePlace {
    cisUuid: string;
    displayName: string;
  }

  interface IDevicePlaceCommon extends IBasePlace {
    accountType: string;
    image: string;
    readonly type?: string;
    sipUrl: string;
    additionalSipUrls: string[];
    tags: string[];
    url: string;
    devices?: Map<string, IDevice>;

    isPlace(): this is IPlace;
    isDevice(): this is IDevice;
  }

  interface IDeviceDiagnosticEvent {
    type: string;
    message: string;
  }

  interface IDeviceUpgradeChannel {
    label: string;
    value: string;
  }

  interface ICode {

  }
}
