import { Browser, Devices, Platforms, ResponseStatus } from './partner-meeting.enum';
import { IVersion } from './partner-search.interfaces';

export class CommonService {
  private data = {};
  public featureName = 'partnerReport.webex.diagnostic';

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {
  }

  public getStatus(num: number): string {
    const statusArr = [
      ResponseStatus.INPROGRESS,
      ResponseStatus.ENDED,
    ];
    return this.$translate.instant(`webexReports.meetingStatus.${statusArr[num - 1]}`);
  }

  public setStorage(key: string, val: any): any {
    _.set(this.data, key, val);
    return this.data[key];
  }

  public getStorage(key: string): any {
    return _.get(this.data, key);
  }

  public utcDateByTimezone(date: number): string {
    if (!date) {
      return '';
    }
    const tz: string = this.getStorage('timeZone');
    const timeZone = tz ? tz : moment.tz.guess();
    const offset = this.getOffset(timeZone);
    return moment.utc(date).utcOffset(offset).format('YYYY-MM-DD hh:mm:ss A');
  }

  public getOffset(timeZone: string): string {
    const tz = timeZone ? timeZone : moment.tz.guess();
    return moment().tz(tz).format('Z');
  }

  public getGuess(tz: string): string {
    return tz ? '' : moment.tz.guess();
  }

  public getNames(tz: string): string | string[] {
    return tz ? '' : moment.tz.names();
  }

  public timestampToDate(timestamp: number, format: string): string {
    const tz = this.getStorage('timeZone');
    const timeZone: any = tz ? tz : moment.tz.guess();
    const offset = this.getOffset(timeZone);
    return moment(timestamp).utc().utcOffset(offset).format(format);
  }

  public getBrowser(num: number): string {
    const arr = [
      Browser.NETSCAPE,
      Browser.IE,
      Browser.TP,
      Browser.MOZILLA,
      Browser.FIREFOX,
      Browser.SAFARI,
      Browser.CHROME,
    ];
    return arr[num] ? arr[num] : this.$translate.instant('webexReports.other');
  }

  public getPlatform(device: { platform: string, browser?: string, sessionType: string }): number | string {
    if (device.sessionType === Platforms.PSTN) {
      return Devices.PSTN;
    }
    const key = _.parseInt(device.platform);
    const arr = [
      Devices.WINDOW,
      Devices.MAC,
      Devices.SOLARIS,
      Devices.JAVA,
      Devices.LINUX,
      Devices.FLASH,
      Devices.JAVASCRIPT,
      Devices.IOS,
      Devices.MOBILE_DEVICE,
      Devices.IP_PHONE,
      Devices.CISCO_TP,
      Devices.BLACK_BERRY,
      Devices.WIN_MOBILE,
      Devices.ANDROID,
      Devices.NOKIA,
    ];
    return arr[key] ? arr[key] : this.$translate.instant('webexReports.other');
  }

  public getParticipantEndReason(endReason: string): string {
    if (endReason === null) {
      return '';
    }
    return endReason ? this.$translate.instant('webexReports.normal') : this.$translate.instant('webexReports.abnormal');
  }

  public isMobilePlatform(platform: string): boolean {
    const mobiles = [
      Platforms.IPHONE,
      Platforms.MOBILE_DEVICE,
      Platforms.BLACK_BERRY,
      Platforms.WIN_MOBILE,
      Platforms.ANDROID,
      Platforms.NOKIA,
    ];
    return _.includes(mobiles, platform);
  }

  public getDevice(device: { platform: string, browser: string, sessionType: string }): { icon: string, name: string} {
    const browser = device.browser;
    const platform = device.platform;
    const sessionType = device.sessionType;
    const browser_ = this.getBrowser(_.parseInt(browser));
    const platform_ = this.getPlatform(device);
    if (this.isMobilePlatform(platform)) {
      return {
        icon: 'icon-mobile-phone',
        name: this.$translate.instant('webexReports.mobilePlatform', { platform: platform_ }),
      };
    }

    if (platform === Platforms.TP) {
      return {
        icon: 'icon-devices',
        name: '',
      };
    }

    if (platform === Platforms.THIN_CLIENT) {
      return {
        icon: 'icon-application',
        name: this.$translate.instant('webexReports.thinClient'),
      };
    }

    if (sessionType === Platforms.PSTN || platform === Platforms.IP_PHONE) {
      return {
        icon: 'icon-phone',
        name: this.$translate.instant('webexReports.phone'),
      };
    }

    if (this.isPcPlatform(_.parseInt(platform))) {
      return browser === Platforms.SOLARIS ? { icon: 'icon-application', name: this.$translate.instant('mediaFusion.metrics.clients') } : { icon: 'icon-browser', name: `${platform_}: ${browser_}` };
    }

    return { icon: '', name: this.$translate.instant('webexReports.other') };
  }

  public isPcPlatform(platformCode: number): boolean {
    return platformCode < _.parseInt(Platforms.IPHONE);
  }

  public getDuration(duration: number): string {
    if (!duration) {
      return '';
    }
    const momentDuration = moment.duration(duration * 1000);
    const days = momentDuration.days();
    let hours = momentDuration.hours();
    if (days > 0) {
      hours += days * 24;
    }
    const minutes = this.prefixZero(momentDuration.minutes());
    const seconds = this.prefixZero(momentDuration.seconds());
    return hours ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
  }

  private prefixZero(data: number): string {
    if (data > 9) {
      return `${data}`;
    } else {
      return `0${data}`;
    }
  }

  public extractData<T>(response: ng.IHttpResponse<T>): T {
    return _.get(response, 'data');
  }

  public toMinOrSec(deltaInMs: number): string {
    if (!deltaInMs) {
      return '';
    }
    let result = '';
    const duration = moment.duration(deltaInMs);
    if (Math.floor(duration.asMinutes())) {
      const minutes = Math.ceil(duration.asMinutes());
      result = this.$translate.instant('time.abbreviatedCap.minutes', { time: minutes }, 'messageformat');
    } else {
      const seconds = Math.floor(duration.asSeconds());
      result = this.$translate.instant('time.abbreviatedCap.seconds', { time: seconds }, 'messageformat');
    }
    return result;
  }

  public getPhoneNumber(phone: string): string {
    if (_.includes(phone, '-') && !_.startsWith(phone, '+')) {
      phone = `+${phone}`;
    }
    return phone;
  }

  public getClientVersion(key: string): IVersion {
    const empty = {
      osVersion: '',
      browserVersion: '',
    };
    const clientVersions = this.getStorage('ClientVersion');
    const clientVersion: IVersion = _.get(clientVersions, key);
    return clientVersion ? clientVersion : empty;
  }

  public getData(): any {
    return this.data;
  }
}
