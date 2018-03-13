import { TokenMethods } from './tokenMethods';
import { Notification } from 'modules/core/notifications';
// import { AgentInstallFileInfo } from 'modules/hcs/setup';

class SetupAgentInstallFileCtrl implements ng.IComponentController {
  private readonly DOMAIN_MAX_LENGTH = 253;
  private readonly MIN_PORT = 1024;
  private readonly MAX_PORT = 65535;

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
  public onChangeFn: Function;

  /* @ngInject*/
  constructor(
    private $timeout: ng.ITimeoutService,
    public $translate,
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
        let tokens = this.getTokens();
        tokens = tokens.splice(_.indexOf(tokens, e.attrs), 1);
        this.Notification.error('hcs.installFiles.duplicateProxy');
        this.setTokens(tokens.map(function (token) {
          return token.value;
        }));
      });
    } else if (!this.validateHttpProxyAddress(e.attrs.value)) {
      angular.element(e.relatedTarget).addClass('invalid');
      e.attrs.invalid = true;
      this.invalidCount++;
    } else {
      if (this.httpProxyTokens.indexOf(e.attrs.value) === -1) {
        this.httpProxyTokens.push(e.attrs);
        this.setInstallFileInfo();
      }
      this.setPlaceholderText('');
    }
  }

  public editToken(e): void {
    this.removeToken(e.attrs.value);
    if (!this.validateHttpProxyAddress(e.attrs.value)) {
      this.invalidCount--;
    }
  }

  private removeToken(value): void {
    const index = _.indexOf(this.httpProxyTokens, value);
    if (index > -1) {
      this.httpProxyTokens.splice(index, 1);
    }
  }

  public validateHttpProxyAddress(value: string): boolean {
    const ipdomain = _.split(value, ':', 2);
    const ip = _.split(ipdomain[0], '.');
    const regex = new RegExp(/^(([a-zA-Z0-9\-]{1,63}[\.]))+([A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z])$/g);
    const ipregex = new RegExp(/^([0-9]{1,3})$/g); //To-Do ipaddress validations
    let portValid = true;

    if (ipdomain[1] && !_.inRange(_.toNumber(ipdomain[1]), this.MIN_PORT, this.MAX_PORT)) {
      portValid = false;
      this.Notification.error('hcs.installFiles.invalidPortError', {
        min: this.MIN_PORT,
        max: this.MAX_PORT,
      });
    }
    return ((!_.isUndefined(ip) && ip.length === 4 && ipregex.test(ip[0])) ||
           regex.test(ipdomain[0]) && (portValid && ipdomain[0].length < this.DOMAIN_MAX_LENGTH));
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
    this.onChangeFn({
      fileName: this.fileName,
      httpProxyList: this.httpProxyTokens,
    });
  }
}

export class  SetupAgentInstallFileComponent implements ng.IComponentOptions {
  public controller = SetupAgentInstallFileCtrl;
  public template = require('modules/hcs/setup/agent-install-file/setup-agent-install-file.component.html');
  public bindings = {
    onChangeFn: '&',
  };
}
