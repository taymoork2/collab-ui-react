'use strict';

describe('Directive: crServiceColumnIcon', function () {
  var $compile, scope;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(inject(function (_$compile_, $rootScope) {
    $compile = _$compile_;
    scope = $rootScope.$new();
    scope.mockData = getJSONFixture('core/json/customers/customer.json');
  }));

  function compileDirective(columnType) {
    var element = angular.element('<cr-service-column-icon row="mockData" type="' + columnType + '"></cr-service-column-icon>');
    var compiledElement = $compile(element)(scope);
    scope.$digest();
    return $(compiledElement);
  }

  function verifyTooltip(tooltipHtml, statusType, serviceType) {
    expect(tooltipHtml.find('.service-name').text()).toEqual('customerPage.' + serviceType);
    if (statusType !== 'free') {
      expect(tooltipHtml.find('.tooltip-qty').text()).toEqual('customerPage.quantityWithValue');
    }
    expect(tooltipHtml.find('.service-status i').attr('class')).toContain(statusType);
    expect(tooltipHtml.find('.tooltip-status').text()).toEqual('customerPage.' + statusType);
  }

  it('should properly compile an expired tooltip', function () {
    var tooltipHtml = $(compileDirective('communications').children().attr('tooltip-html-unsafe'));
    verifyTooltip(tooltipHtml, 'expired', 'call');
  });

  it('should properly compile a trial tooltip', function () {
    var tooltipHtml = $(compileDirective('roomSystems').children().attr('tooltip-html-unsafe'));
    verifyTooltip(tooltipHtml, 'trial', 'roomSystems');
  });

  it('should properly compile an active tooltip', function () {
    var tooltipHtml = $(compileDirective('conferencing').children().attr('tooltip-html-unsafe'));
    verifyTooltip(tooltipHtml, 'purchased', 'meeting');
  });

  it('should properly compile a free tooltip', function () {
    var tooltipHtml = $(compileDirective('messaging').children().attr('tooltip-html-unsafe'));
    verifyTooltip(tooltipHtml, 'free', 'message');
  });

  it('should properly compile a webex tooltip', function () {
    var tooltipHtml = $(compileDirective('webex').children().attr('tooltip-html-unsafe'));
    expect(tooltipHtml.find('.service-name').text()).toEqual('customerPage.webex');
    expect(tooltipHtml.find('.tooltip-block').length).toEqual(1);
    expect(tooltipHtml.find('.tooltip-qty').length).toEqual(1);
    expect(tooltipHtml.find('.service-status').length).toEqual(1);
    expect(tooltipHtml.find('.tooltip-block .tooltip-url').text()).toEqual('example.webex.com');
    expect(tooltipHtml.find('.tooltip-block .tooltip-qty').text()).toEqual('customerPage.quantityWithValue');
    expect(tooltipHtml.find('.tooltip-block i').attr('class')).toContain('trial');
    expect(tooltipHtml.find('.tooltip-block .tooltip-status').text()).toEqual('customerPage.trial');
  });
});
