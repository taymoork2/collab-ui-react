import { TokenMethods } from './tokenMethods';
import { Notification } from 'modules/core/notifications';

class SetupAgentInstallFileCtrl implements ng.IComponentController {
  private readonly DOMAIN_MAX_LENGTH = 253;
  private readonly MIN_PORT = 1024;
  private readonly MAX_PORT = 65535;
  private readonly MAX_FILENAME_LENGTH = 255;

  public fileName: string;
  public httpProxyTokens: any[] = [];

  public tokenfieldid: string = 'httpProxyId';
  public tokenplaceholder: string;
  public tokenoptions: Object = {
    delimiter: [',', ';'],
    createTokensOnBlur: true,
    tokens: [],
    minLength: 3,
    beautify: false,
  };
  public tokenmethods: TokenMethods;
  public invalidCount: number = 0;
  public messages: Object;
  public validators: Object;
  public onChangeFn: Function;
  public form: ng.IFormController;

  /* @ngInject*/
  constructor(
    private $timeout: ng.ITimeoutService,
    public $translate: ng.translate.ITranslateService,
    private Notification: Notification,
  ) {
    this.tokenplaceholder = this.$translate.instant('hcs.installFiles.placeholderHttpProxy');
    this.tokenmethods = new TokenMethods(
      this.createToken.bind(this),
      this.createdToken.bind(this),
      this.editToken.bind(this),
      this.removeToken.bind(this),
    );
  }

  public $onInit(): void {
    this.messages = {
      required: this.$translate.instant('common.invalidRequired'),
      invalid: this.$translate.instant('hcs.installFiles.invalidChars'),
      maxlength: this.$translate.instant('common.invalidMaxLength', {
        max: this.MAX_FILENAME_LENGTH,
      }),
    };
    this.validators = {
      invalid: (viewValue: string) => this.validateFileName(viewValue),
    };
  }
  public createToken(e): void {
    const duplicate = _.find(this.getTokens(), {
      value: e.attrs.value,
    });
    if (duplicate) {
      e.attrs.duplicate = true;
    }
  }

  public createdToken(e): void {
    if (e.attrs.duplicate) {
      this.$timeout(() => {
        const tokens = this.getTokens();
        tokens.splice(_.findLastIndex(tokens, { value: _.get(e.attrs, 'value') }), 1);
        this.Notification.error('hcs.installFiles.duplicateProxy');
        this.setTokens(tokens.map(function (tokens) {
          return tokens.value;
        }));
      });
    } else if (!this.validateHttpProxyAddress(e.attrs.value)) {
      angular.element(e.relatedTarget).addClass('invalid');
      e.attrs.invalid = true;
      this.invalidCount++;
      this.setInstallFileInfo();
    } else {
      if (this.httpProxyTokens.indexOf(e.attrs.value) === -1) {
        this.httpProxyTokens.push(e.attrs);
        this.setInstallFileInfo();
      }
      this.setPlaceholderText('');
    }
  }

  public editToken(e): void {
    this.removeToken(e);
    if (!this.validateHttpProxyAddress(e.attrs.value)) {
      this.invalidCount--;
    }
  }

  private removeToken(e): void {
    if (!this.validateHttpProxyAddress(e.attrs.value)) {
      this.invalidCount--;
    }
    const index = _.findIndex(this.httpProxyTokens, (item) => item.value === e.attrs.value);
    if (index > -1) {
      this.httpProxyTokens.splice(index, 1);
    }
    this.setInstallFileInfo();
  }

  public validateHttpProxyAddress(value: string): boolean {
    const ipdomain = _.split(value, ':', 2);
    const ip = _.split(ipdomain[0], '.');
    const regex = new RegExp(/^(([a-zA-Z0-9\-]{1,63}[\.]))+([A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z])$/g);
    const ipregex = new RegExp(/^(\b[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\b)$/g); //To-Do ipaddress validations
    let portValid = true;

    if (ipdomain[1] && !_.inRange(_.toNumber(ipdomain[1]), this.MIN_PORT, this.MAX_PORT)) {
      portValid = false;
      this.Notification.error('hcs.installFiles.invalidPortError', {
        min: this.MIN_PORT,
        max: this.MAX_PORT,
      });
    }
    const IPADDR_OCTET = 255;
    let isIpValid: boolean = true;
    _.each(ip, ipaddr => {
      isIpValid = _.inRange(_.toNumber(ipaddr), 0, IPADDR_OCTET);
      if (!isIpValid) {
        return false;
      }
    });
    return (((!_.isUndefined(ip) && ipregex.test(value)) && isIpValid ||
           regex.test(ipdomain[0])) && (portValid && ipdomain[0].length < this.DOMAIN_MAX_LENGTH));
  }

  public validateFileName(file: string): boolean {
    const regex = new RegExp(/^([0-9a-zA-Z]+[^\b\~\#\%\&\*\{\}\\\:\<\>\?\/\+\|\"\'\s])+$/g);
    return regex.test(file);
  }

  private setPlaceholderText(text): void {
    $('#' + this.tokenfieldid).attr('placeholder', text);
  }

  private getTokens(): {value, label}[] {
    return (angular.element('#' + this.tokenfieldid) as any).tokenfield('getTokens');
  }

  private setTokens(tokens): void {
    (angular.element('#' + this.tokenfieldid) as any).tokenfield('setTokens', tokens);
  }

  public setInstallFileInfo(): void {
    this.form.$setValidity('', true, this.form);
    if (this.invalidCount) {
      this.form.$setValidity('', false, this.form);
    }
    this.onChangeFn({
      fileName: this.fileName,
      httpProxyList: this.httpProxyTokens,
    });
  }
}

export class  SetupAgentInstallFileComponent implements ng.IComponentOptions {
  public controller = SetupAgentInstallFileCtrl;
  public template = require('modules/hcs/hcs-setup/hcs-setup-agent-install-file/setup-agent-install-file.component.html');
  public bindings = {
    onChangeFn: '&',
  };
}
