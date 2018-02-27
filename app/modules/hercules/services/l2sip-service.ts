export interface ISipDestinationSteps {
  steps: VerificationStep[];
}

interface IHopWithHostname {
  host: string;
  hostname: string;
  port: number;
  source: 'DNS';
  transport: 'tls';
}

interface IHopWithoutHostname {
  host: string;
  hostname: undefined;
  port: number;
  source: 'DNS';
  transport: 'tls';
}

interface IDNSSvrFoundStep {
  type: 'DNSSvrFound';
  severity: 'Info';
  description: string;
  Srv: string;
  hops: IHopWithHostname[];
}

interface IDNSHostNameFoundStep {
  type: 'DNSHostNameFound';
  severity: 'Info';
  description: string;
  hop: IHopWithHostname;
}

interface IDNSIpFoundStep {
  type: 'DNSIpFound';
  severity: 'Info';
  description: string;
  hop: IHopWithoutHostname;
}

interface INoDNSHopsFoundStep {
  type: 'NoDNSHopsFound';
  severity: 'Error';
}

interface IServerTestBeginStep {
  type: 'ServerTestBegin';
  severity: 'Info';
  description: string;
  server: number;
}

interface IConnectingTest {
  type: 'Connecting';
  severity: 'Info';
  description: string;
  hop: IHopWithHostname | IHopWithoutHostname;
}

interface ISocketConnectedStep {
  type: 'SocketConnected';
  severity: 'Info';
}

interface ISSLHandshakeCompletedStep {
  type: 'SSLHandshakeCompleted';
  severity: 'Info';
}

interface IPingSucceededStep {
  type: 'PingSucceeded';
  severity: 'Info';
}

interface IPingFailedStep {
  type: 'PingFailed';
  severity: 'Error';
  reasonCode: number;
}

interface IServerTestEndStep {
  type: 'ServerTestEnd';
  severity: 'Info';
}

interface IIOFailureStep {
  type: 'IOFailure';
  severity: 'Error';
  description: string;
  exception: string;
}

interface ISSLHandshakeFailureStep {
  type: 'SSLHandshakeFailure';
  severity: 'Error';
  description: string;
  exception: string;
}

interface ISocketTimedOutStep {
  type: 'SocketTimedOut';
  severity: 'Error';
  description: string;
}

interface ISocketConnectionFailureStep {
  type: 'SocketConnectionFailure';
  severity: 'Error';
  description: string;
  exception: string;
}

interface ISocketReadWriteFailureStep {
  type: 'SocketReadWriteFailure';
  severity: 'Error';
  description: string;
  exception: string;
}

type FirstStep = IDNSSvrFoundStep | IDNSHostNameFoundStep | IDNSIpFoundStep | INoDNSHopsFoundStep;
export type VerificationStep = FirstStep | IServerTestBeginStep | IConnectingTest | ISocketConnectedStep | ISSLHandshakeCompletedStep | IPingSucceededStep | IPingFailedStep | IServerTestEndStep | IIOFailureStep | ISSLHandshakeFailureStep | ISocketTimedOutStep | ISocketConnectionFailureStep | ISocketReadWriteFailureStep;

export type StepSeverity = 'Info' | 'Warn' | 'Error';

type TestSuccess = { status: 'success' };
type TestError = {
  status: 'error',
  type: string,
  error?: string,
};
interface IFormattedTest {
  target: string;
  connecting: null | TestSuccess | TestError;
  socket: null | TestSuccess | TestError;
  sslHandshake: null | TestSuccess | TestError;
  ping: null | TestSuccess | TestError;
}

export interface IFormattedResult {
  type: 'error' | 'ip' | 'dnssrv' | 'dnshost';
  meta: {
    dns: string;
    fqdns: string[];
    ips: string[];
  };
  tests: IFormattedTest[];
}

export class L2SipService {
  private l2sipUrl: string;

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private Authinfo,
    private UrlConfig,
  ) {
    this.l2sipUrl = this.UrlConfig.getL2sipUrl();
  }

  private extractData(res) {
    return res.data;
  }

  public verifySipDestination(expresswayUrl: string, verifyTls: boolean = true): ng.IPromise<ISipDestinationSteps> {
    const params: any = {
      name: expresswayUrl,
      validateTls: verifyTls,
    };
    if (this.Authinfo.isCustomerLaunchedFromPartner()) {
      params.orgId = this.Authinfo.getOrgId();
    }
    return this.$http
      .get(`${this.l2sipUrl}/test/dns`, {
        params: params,
      })
      .then(this.extractData);
  }

  public userTestCall(caller: string, callee: string): ng.IPromise<ISipDestinationSteps> {
    return this.$http
      .get(`${this.l2sipUrl}/test/users?caller=${caller}&called=${callee}`)
      .then(this.extractData);
  }

  public formatSipTestResult(steps: VerificationStep[]): IFormattedResult {
    // TODO: Handle UnexpectedException
    const result: IFormattedResult = {
      type: 'error',
      meta: {
        dns: '',
        fqdns: [],
        ips: [],
      },
      tests: [],
    };
    const firstStep = _.head(steps) as FirstStep;
    if (firstStep.type === 'DNSSvrFound') {
      result.type = 'dnssrv';
      result.meta.dns = firstStep.Srv;
      firstStep.hops.forEach((hop) => {
        result.meta.fqdns.push(hop.hostname);
        result.meta.ips.push(hop.host);
      });
    } else if (firstStep.type === 'DNSHostNameFound') {
      result.type = 'dnshost';
      result.meta.dns = firstStep.hop.hostname;
      result.meta.fqdns.push(firstStep.hop.hostname);
      result.meta.ips.push(firstStep.hop.host);
    } else if (firstStep.type === 'DNSIpFound') {
      result.type = 'ip';
      result.meta.ips.push(firstStep.hop.host);
    } else if (firstStep.type === 'NoDNSHopsFound') {
      result.type = 'error';
    }
    let currentTarget: string | null = null;
    const formattedTests = steps.reduce((acc, step, index, collection) => {
      if (step.type === 'Connecting') {
        currentTarget = step.description;
        acc[currentTarget] = <IFormattedTest>{
          target: currentTarget,
          connecting: null,
          socket: null,
          sslHandshake: null,
          ping: null,
        };
        (acc[currentTarget] as IFormattedTest).connecting = { status: 'success' };
      } else if (step.type === 'SocketConnected') {
        (acc[(currentTarget as string)] as IFormattedTest).socket = { status: 'success' };
      } else if (_.includes(['SocketTimedOut', 'SocketConnectionFailure', 'SocketReadWriteFailure', 'IOFailure'], step.type)) {
        if (step.type === 'SocketTimedOut') {
          (acc[(currentTarget as string)] as IFormattedTest).socket = { status: 'error', type: step.type, error: step.description };
        } else if (step.type === 'SocketConnectionFailure') {
          (acc[(currentTarget as string)] as IFormattedTest).socket = { status: 'error', type: step.type, error: `${step.description} ${step.exception}` };
        } else if (step.type === 'SocketReadWriteFailure') {
          (acc[(currentTarget as string)] as IFormattedTest).socket = { status: 'error', type: step.type };
        } else if (step.type === 'IOFailure') {
          const previousStep = collection[index - 1];
          // If "IOFailure" is following "Connecting", then modify the previous step
          if (previousStep.type === 'Connecting') {
            (acc[currentTarget!] as IFormattedTest).connecting = { status: 'error', type: previousStep.type, error: `${step.description} ${step.exception}` };
          } else {
            (acc[(currentTarget as string)] as IFormattedTest).socket = { status: 'error', type: step.type, error: `${step.description} ${step.exception}` };
          }
        }
      } else if (step.type === 'SSLHandshakeCompleted') {
        (acc[(currentTarget as string)] as IFormattedTest).sslHandshake = { status: 'success' };
      } else if (step.type === 'SSLHandshakeFailure') {
        (acc[(currentTarget as string)] as IFormattedTest).sslHandshake = { status: 'error', type: step.type, error: `${step.description} ${step.exception}` };
      } else if (step.type === 'PingSucceeded') {
        (acc[(currentTarget as string)] as IFormattedTest).ping = { status: 'success' };
      } else if (step.type === 'PingFailed') {
        (acc[(currentTarget as string)] as IFormattedTest).ping = { status: 'error', type: step.type, error: String(step.reasonCode) };
      }
      return acc;
    }, {});
    result.tests = _.toArray(formattedTests);
    return result;
  }
}

export default angular
  .module('core.l2sip-service', [
    require('modules/core/config/urlConfig'),
  ])
  .service('L2SipService', L2SipService)
  .name;
