import { SearchResult } from './csdmSearch.service';
import IHttpPromiseCallbackArg = angular.IHttpPromiseCallbackArg;
import { DeviceHelper, HuronDeviceHelper } from './csdmHelper';
export class DeviceSearchConverter {
  private deviceHelper: DeviceHelper;
  /* @ngInject */
  constructor($translate) {
    this.deviceHelper = new DeviceHelper($translate);
  }

  public convertSearchResult(result: IHttpPromiseCallbackArg<SearchResult>) {
    if (result.data && result.data.hits && result.data.hits.hits) {
      result.data.hits.hits.forEach(d => Device.convert(this.deviceHelper, d));
    }
    return result;
  }

}

export class Device {
  public image: string;
  private imageFileName: string;
  public tags: string[];
  public description: string;
  public cssColorClass: string;
  public productFamily: string;
  public ip: string;
  public state: { readableState: string };

  constructor(deviceHelper) {
    Device.init(deviceHelper, this);
  }

  private static init(deviceHelper: DeviceHelper, device: Device) {
    device.image = 'images/devices-hi/' + (device.imageFileName || 'unknown.png');
    device.cssColorClass = DeviceHelper.getCssColorClass(device);
    device.ip = device.ip || DeviceHelper.getIp(device);
    device.state = deviceHelper.getState(device);
    if (device.productFamily === 'Huron' || device.productFamily === 'ATA') {
      Device.initAsHuron(device);
    } else {
      Device.initAsCloudberry(device);
    }

  }

  private static initAsHuron(device: Device) {
    device.tags = DeviceHelper.getTags(HuronDeviceHelper.decodeHuronTags(device.description));
  }

  private static initAsCloudberry(device: Device) {
    device.tags = DeviceHelper.getTags(device.description);
  }

  public static convert(deviceHelper, device: object) {
    return Device.init(deviceHelper, <Device>device);
  }
}
