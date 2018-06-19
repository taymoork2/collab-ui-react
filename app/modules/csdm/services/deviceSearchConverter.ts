import IHttpResponse = angular.IHttpResponse;
import { DeviceHelper, HuronDeviceHelper } from './csdmHelper';
import { SearchResult } from './search/searchResult';

interface IPlace {
  displayName: string;
  cisUuid: string;
  isPlace(): boolean;
  url: string;
}

export interface IIdentifiableDevice {
  cisUuid: string;
  displayName: string;
  url: string;
}

export class DeviceSearchConverter {
  private csdmPlacesUrl: string;
  private deviceHelper: DeviceHelper;

  /* @ngInject */
  constructor($translate, private UrlConfig, private Authinfo) {
    this.csdmPlacesUrl = this.UrlConfig.getCsdmServiceUrl() + '/organization/' + this.Authinfo.getOrgId() + '/places/';
    this.deviceHelper = new DeviceHelper($translate);
  }

  public convertSearchResult(result: IHttpResponse<SearchResult>): IHttpResponse<SearchResult> {
    if (result.data && result.data.hits && result.data.hits.hits) {
      result.data.hits.hits.forEach(d => Device.convert(this.deviceHelper, d));
    }
    return result;
  }

  public createPlaceholderPlace(device: IIdentifiableDevice): IPlace {
    const newPlaceUrl = this.csdmPlacesUrl + device.cisUuid;

    return {
      cisUuid: device.cisUuid,
      displayName: device.displayName,
      isPlace: () => true,
      url: newPlaceUrl };
  }
}

export class Device implements IIdentifiableDevice {
  public image: string;
  private imageFilename: string;
  public imageThumb: string | null;
  public tags: string[];
  public description: string;
  public cssColorClass: string;
  public productFamily: string;
  public ip: string;
  public state: { readableState: string };
  public product: string;
  public url: string;
  public displayName: string;
  public cisUuid: string;
  public type: string;
  private _isCloudberry: boolean;

  constructor(deviceHelper) {
    Device.init(deviceHelper, this);
  }

  public isDevice(): boolean {
    return true;
  }

  public isCloudberryDevice(): boolean {
    return this._isCloudberry;
  }

  public isHuronDevice(): boolean {
    return !this._isCloudberry;
  }

  private static init(deviceHelper: DeviceHelper, device: Device) {
    device.isDevice = () => { return true; };
    device.image = 'images/devices-hi/' + (device.imageFilename || 'unknown.png');
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
    device._isCloudberry = false;
    device.isCloudberryDevice = () => { return false; };
    device.isHuronDevice = () => { return true; };
    device.type = 'huron';
    device.imageThumb = device.imageFilename ? `images/devices-hi/transparent/${device.imageFilename}` : null;
    device.tags = DeviceHelper.getTags(HuronDeviceHelper.decodeHuronTags(device.description));
    device.product = device.product in HuronDeviceHelper.huron_model_map ? HuronDeviceHelper.huron_model_map[device.product].displayName : DeviceHelper.getProduct(device.product);
  }

  private static initAsCloudberry(device: Device) {
    device._isCloudberry = true;
    device.isCloudberryDevice = () => { return true; };
    device.isHuronDevice = () => { return false; };
    device.imageThumb = device.imageFilename ? device.image : null;
    device.tags = DeviceHelper.getTags(device.description);
  }

  public static convert(deviceHelper, device: object) {
    return Device.init(deviceHelper, <Device>device);
  }
}
