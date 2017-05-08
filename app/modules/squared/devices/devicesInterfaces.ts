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
    state: { readableState: string };
    cssColorClass: string;
    photos: string[];
    product: string;
    productFamily: string;
    diagnosticsEvents: IDeviceDiagnosticEvent[];
    upgradeChannel: IDeviceUpgradeChannel;
    hasIssues: boolean;
    readableActiveInterface: string;
  }

  interface IDevicePlaceCommon {
    accountType: string;
    cisUuid: string;
    displayName: string;
    image: string;
    isPlace?: boolean;
    readonly type?: string;
    sipUrl: string;
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
}
