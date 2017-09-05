import searchModule from '../index';
import { SearchTranslator } from './searchTranslator';

describe('SearchTranslator', () => {
  beforeEach(function () {
    this.initModules(searchModule);
    this.injectDependencies('$translate', 'CsdmSearchService', 'UrlConfig', 'Authinfo', '$rootScope');
    spyOn(this.$translate, 'getTranslationTable').and.returnValue({
      'CsdmStatus.OnlineWithIssues': 'Online, With Issues',
      'CsdmStatus.activeInterface.lan': 'Wired',
      'CsdmStatus.upgradeChannels.Beta': 'Beta',
      'CsdmStatus.errorCodes.MediaBlockingDetected.type': 'Network Ports Blocked',
      'CsdmStatus.errorCodes.MediaBlockingDetected.message': "Firewall may be blocking media on UDP and TCP. Call quality may be impacted. For information regarding the network port requirements see the article <a href='https://support.ciscospark.com/customer/portal/articles/1911657' class='issue-link'>Firewalls and Network Requirements for the Cisco Spark App</a>.",
    });
  });

  it('should translate an all expressions match', function () {
    const searchTranslator = new SearchTranslator(this.$translate);
    const tr = searchTranslator.translate('With issues');
    expect(tr).toBeDefined();
    expect(tr).toBe('( With issues ) OR connectionStatus=CONNECTED_WITH_ISSUES');
  });

  it('should translate an partial expression match', function () {
    const searchTranslator = new SearchTranslator(this.$translate);
    const tr = searchTranslator.translate('With issues sx10');
    expect(tr).toBeDefined();
    expect(tr).toBe('( ( With issues ) OR connectionStatus=CONNECTED_WITH_ISSUES ) sx10');
  });

  it('should translate an partial expression match with no match before', function () {
    const searchTranslator = new SearchTranslator(this.$translate);
    const tr = searchTranslator.translate('sx10 With issues');
    expect(tr).toBeDefined();
    expect(tr).toBe('sx10 ( ( With issues ) OR connectionStatus=CONNECTED_WITH_ISSUES )');
  });

  it('should translate an partial expression match with no match before and remove leading and trailing spaces', function () {
    const searchTranslator = new SearchTranslator(this.$translate);
    const tr = searchTranslator.translate(' sx10 With issues ');
    expect(tr).toBeDefined();
    expect(tr).toBe('sx10 ( ( With issues ) OR connectionStatus=CONNECTED_WITH_ISSUES )');
  });

  it('should translate an software channel', function () {
    const searchTranslator = new SearchTranslator(this.$translate);
    const tr = searchTranslator.translate('Beta');
    expect(tr).toBeDefined();
    expect(tr).toBe('Beta OR upgradeChannel=Beta');
  });

  it('should translate an activeInterface ', function () {
    const searchTranslator = new SearchTranslator(this.$translate);
    const tr = searchTranslator.translate('Wired');
    expect(tr).toBeDefined();
    expect(tr).toBe('Wired OR activeInterface=lan');
  });

  it('should translate an errorCode by type', function () {
    const searchTranslator = new SearchTranslator(this.$translate);
    const tr = searchTranslator.translate('Network Ports Blocked');
    expect(tr).toBeDefined();
    expect(tr).toBe('( Network Ports Blocked ) OR errorCodes=MediaBlockingDetected');
  });

  it('should translate an errorCode ', function () {
    const searchTranslator = new SearchTranslator(this.$translate);
    const tr = searchTranslator.translate('blocking media on UDP and TCP');
    expect(tr).toBeDefined();
    expect(tr).toBe('( blocking media on UDP and TCP ) OR errorCodes=MediaBlockingDetected');
  });

  it('should allow for parenthesis', function () {
    const searchTranslator = new SearchTranslator(this.$translate);
    const tr = searchTranslator.translate('( With issues ) AND (sx or 88)');
    expect(tr).toBeDefined();
    expect(tr).toBe('( ( ( With issues ) OR connectionStatus=CONNECTED_WITH_ISSUES ) ) AND (sx or 88)');
  });
});
