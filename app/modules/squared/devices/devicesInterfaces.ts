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
    state: {};
    cssColorClass: string;
    photos: string[];
    product: string;
    productFamily: string;
  }
  interface IDevicePlaceCommon {
    accountType: string;
    cisUuid: string;
    displayName: string;
    image: string;
    readonly type?: string;
    sipUrl: string;
    tags: string[];
    url: string;
  }
}
