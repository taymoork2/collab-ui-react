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
    state: { key: string, readableState: string };
    cssColorClass: string;
    photos: string[];
    product: string;
    productFamily: string;
    diagnosticsEvents: IDeviceDiagnosticEvent[];
    upgradeChannel: IDeviceUpgradeChannel;
    hasIssues: boolean;
    readableActiveInterface: string;
  }

  interface IBasePlace {
    cisUuid: string;
    displayName: string;
  }

  interface IDevicePlaceCommon extends IBasePlace {
    accountType: string;
    image: string;
    isPlace?: boolean;
    readonly type?: string;
    sipUrl: string;
    additionalSipUrls: string[];
    tags: string[];
    url: string;
    devices?: Map<string, IDevicePlaceCommon>;
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
