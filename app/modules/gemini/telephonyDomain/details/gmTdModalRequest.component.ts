import { TelephonyDomainService } from '../telephonyDomain.service';
import { Notification } from 'modules/core/notifications';

class GmTdModalRequestCtrl implements ng.IComponentController {

  private close;
  public data: any = {};
  public messages: Object;
  public selectPlaceholder: string;
  public options: Array<Object> = [];
  public selected = { label: '', value: '' };

  /* @ngInject */
  public constructor(
    private gemService,
    private Notification: Notification,
    private $translate: ng.translate.ITranslateService,
    private TelephonyDomainService: TelephonyDomainService,
  ) {
    this.selectPlaceholder = this.$translate.instant('gemini.tds.request.selectPlaceholder');
    this.data = this.gemService.getStorage('currentTelephonyDomain');
    const region = this.data.region || this.data.regionName || this.data.regionId || '';
    this.selected = { label: region, value: region };
  }

  public $onInit() {
    this.getCountries();
    this.getRegions();
    this.messages = {
      customerName: {
        required: this.$translate.instant('common.invalidRequired'),
        warning: this.$translate.instant('gemini.invalidCharacters', { field: 'Telephony Domain Name' }),
        maxlength: this.$translate.instant('gemini.inputLengthError', { length: 60, field: 'customer name' }),
      },
      partnerName: { maxlength: this.$translate.instant('gemini.inputLengthError', { length: 50, field: 'partner name' }) },
      noteToCiscoTeam: { maxlength: this.$translate.instant('gemini.inputLengthError', { length: 50, field: 'note' }) },
    };
  }

  public onWarning() {
    const reg = /[<>~!@#$%^&*=|/<>"{}\[\]:;']+/g;
    return reg.test(this.data.domainName);
  }

  public getRegions() {
    this.TelephonyDomainService.getRegions()
      .then((res) => {
        let optionsSource: any = _.get(res, 'content.data.body');
        this.options = _.map(optionsSource, (item: any) => {
          return { value: item.regionId, label: item.regionName };
        });
      })
      .catch((res) => {
        this.Notification.errorResponse(res, 'gemini.errorCode.genericError');
      });
  }

  private getCountries(): void {
    let countryOptions: any = this.gemService.getStorage('countryOptions') || [];
    let countryId2NameMapping: any = this.gemService.getStorage('countryId2NameMapping') || {};
    let countryName2IdMapping: any = this.gemService.getStorage('countryName2IdMapping') || {};
    if (countryOptions.length === 0) {
      this.TelephonyDomainService.getCountries().then((res: any) => {
        _.forEach(_.get(res, 'content.data'), (item: any) => {
          countryId2NameMapping[item.countryId] = item.countryName;
          countryName2IdMapping[item.countryName] = item.countryId;
          countryOptions.push({ label: item.countryName, value: item.countryId });
        });
      });

      this.gemService.setStorage('countryId2NameMapping', countryId2NameMapping);
      this.gemService.setStorage('countryName2IdMapping', countryName2IdMapping);
      this.gemService.setStorage('countryOptions', countryOptions);
    }
  }

  public onNext() {
    this.data.customerId = this.gemService.getStorage('gmCustomerId');
    this.data.region = this.selected.value;
    this.data.isEdit = true;
    this.gemService.setStorage('currentTelephonyDomain', this.data);

    this.close();
  }
}

export class GmTdModalRequestComponent implements ng.IComponentOptions {
  public bindings = { dismiss: '&', close: '&' };
  public controller = GmTdModalRequestCtrl;
  public templateUrl = 'modules/gemini/telephonyDomain/details/gmTdModalRequest.html';
}
