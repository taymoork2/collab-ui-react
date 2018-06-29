import { MetricsService } from 'modules/core/metrics';
import { OperationalKey } from 'modules/core/metrics/metrics.keys';
import { WindowEventService } from 'modules/core/window';

export class SecurityPolicyViolationService {
  /* @ngInject */
  constructor(
    private WindowEventService: WindowEventService,
    private Auth,
    private MetricsService: MetricsService,
  ) { }

  public init() {
    this.WindowEventService.registerEventListener('securitypolicyviolation', (e) => {
      this.onSecurityPolicyViolation(e);
    });
  }

  public onSecurityPolicyViolation(e: Event): void {
    if (this.Auth.isLoggedIn()) {
      this.sendContentSecurityViolationToInflux(e);
    }
  }

  /* For the time being we will massage violations into operation
  data for InfluxDB. The plan is to curb CSP violations and then
  utilize splunk to send more detailed violation data */
  private sendContentSecurityViolationToInflux(data) {
    const key = OperationalKey.CSP_VIOLATION;
    const props = {
      blocked_uri: _.get(data, 'blockedURI'),
      document_uri: _.get(data, 'documentURI'),
      line_number: _.get(data, 'lineNumber'),
      script_sample: _.get(data, 'sample'),
      violated_directive: _.get(data, 'violatedDirective'),
    };

    return this.MetricsService.trackOperationalMetric(key, props);
  }

}
