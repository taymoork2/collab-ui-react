import IHttpResponse = angular.IHttpResponse;
import { DeviceHelper, HuronDeviceHelper } from './csdmHelper';
import { SearchResult } from './search/searchResult';

export class DeviceSearchConverter {
  private deviceHelper: DeviceHelper;

  /* @ngInject */
  constructor($translate) {
    this.deviceHelper = new DeviceHelper($translate);
  }

  public convertSearchResult(result: IHttpResponse<SearchResult>): IHttpResponse<SearchResult> {
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
  private errorCodes: string[];
  public translatedErrorCodes: { type: string, message: string }[];
  public product: string;

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
      Device.initAsCloudberry(deviceHelper, device);
    }

  }

  private static initAsHuron(device: Device) {
    device.tags = DeviceHelper.getTags(HuronDeviceHelper.decodeHuronTags(device.description));
    device.product = device.product in HuronDeviceHelper.huron_model_map ? HuronDeviceHelper.huron_model_map[device.product].displayName : DeviceHelper.getProduct(device);
  }

  private static initAsCloudberry(deviceHelper: DeviceHelper, device: Device) {
    device.tags = DeviceHelper.getTags(device.description);
    device.translatedErrorCodes = _.map(device.errorCodes, code => deviceHelper.translateErrorCode(code));
    // this.diagnosticsEvents = deviceHelper.getDiagnosticsEvents(device);
  }

  public static convert(deviceHelper, device: object) {
    return Device.init(deviceHelper, <Device>device);
  }
}
