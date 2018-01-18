import { MetricsService } from 'modules/core/metrics';
import { OperationalKey } from 'modules/core/metrics/metrics.keys';


export class SecurityPolicyViolationService {
  /* @ngInject */
  constructor(
    private $window: ng.IWindowService,
    private Auth,
    private MetricsService: MetricsService,
  ) { }

  public init() {
    this.$window.addEventListener('securitypolicyviolation', (e: Event) => {
      if (this.Auth.isLoggedIn()) {
        this.sendContentSecurityViolationToInflux(e);
      }
    });
  }

  /* For the time being we will massage violations into operation
  data for InfluxDB. The plan is to curb CSP violations and then
  utilize splunk to send more detailed violation data */
  private sendContentSecurityViolationToInflux(data) {
    const key = OperationalKey.CSP_VIOLATION;
    const props = {
      blockedUri: _.get(data, 'csp-report.blocked-uri'),
      documentUri: _.get(data, 'csp-report.document-uri'),
      lineNumber: _.get(data, 'csp-report.line-number'),
      scriptSample: _.get(data, 'csp-report.script-sample'),
      violatedDirectrive: _.get(data, 'csp-report.violated-directive'),
    };

    return this.MetricsService.trackOperationalMetric(key, props);
  }

}
