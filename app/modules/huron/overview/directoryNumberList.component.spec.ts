import { Line } from '../lines/services';

describe('Component: directoryNumberList', () => {
  let directoryNumbers: Line[] = [
   {
      uuid: '6d3f07a6-f868-4ae7-990d-286ce033834d',
      internal: '2329',
      external: '',
      siteToSite: '71002329',
      incomingCallMaximum: 2,
      primary: true,
   },
   {
      uuid: '35fb962b-824c-44f3-9e13-2ed171e69249',
      internal: '5015',
      external: '7100XXXX',
      siteToSite: '71005015',
      incomingCallMaximum: 8,
      primary: false,
   },
];

  beforeEach(function() {
    this.initModules('Huron');
    this.injectDependencies('$scope');
    this.$scope.directoryNumbers = directoryNumbers;
    this.compileComponent('directoryNumberList', {
      directoryNumbers: 'directoryNumbers',
      directoryNumberSref: 'test.state',
    });
  });

  it('should expose a `directoryNumbers` object', function() {
    expect(this.controller.directoryNumbers).toBeDefined();
    expect(this.controller.directoryNumbers.length).toBeGreaterThan(0);
    expect(this.controller.directoryNumbers[0].internal).toBe('2329');
  });

  it('should create directory number link with usage type', function() {
    let firstNumber = this.view.find('li a').first();

    expect(firstNumber).toHaveAttr('ui-sref', 'test.state');
    expect(firstNumber).toContainText('2329');
    expect(firstNumber).not.toContainText('common.or');
    expect(firstNumber).toContainText('helpdesk.primary');
  });

  it('should create directory number link with alt dn pattern', function() {
    let lastNumber = this.view.find('li a').last();

    expect(lastNumber).toHaveAttr('ui-sref', 'test.state');
    expect(lastNumber).toContainText('5015');
    expect(lastNumber).toContainText('common.or 7100XXXX');
  });
});
