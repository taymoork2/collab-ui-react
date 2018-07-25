'use strict';

describe('Directive: crServiceColumnIcon', function () {
  var $compile, Authinfo, scope, element;

  afterEach(function () {
    if (element) {
      element.remove();
    }
    element = undefined;
  });

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(inject(function (_$compile_, _Authinfo_, $rootScope) {
    $compile = _$compile_;
    Authinfo = _Authinfo_;
    scope = $rootScope.$new();
    scope.mockData = getJSONFixture('core/json/customers/customer.json');

    spyOn(Authinfo, 'getOrgId').and.returnValue('partner-org-id');
    spyOn(Authinfo, 'getPrimaryEmail').and.returnValue('partner@company.com');
  }));

  function compileDirective(columnType) {
    var template = angular.element('<cr-service-column-icon row="mockData" type="' + columnType + '"></cr-service-column-icon>');
    element = $compile(template)(scope);
    scope.$digest();
    return element;
  }

  function verifyTooltip(tooltipHtml, statusType, serviceType, isManagedByOthers) {
    expect(tooltipHtml.find('.service-name').text()).toEqual('customerPage.' + serviceType);
    if (statusType !== 'free') {
      expect(tooltipHtml.find('.tooltip-qty').text()).toEqual('customerPage.quantityWithValue');
    }
    expect(tooltipHtml.find('.service-status i').attr('class')).toContain(statusType);
    expect(tooltipHtml.find('.tooltip-status').text()).toEqual('customerPage.' + statusType);
    if (isManagedByOthers) {
      expect(tooltipHtml.find('.tooltip-anotherPartner').text()).toEqual('customerPage.anotherPartner');
    } else {
      expect(tooltipHtml.find('.tooltip-anotherPartner').text()).toEqual('');
    }
  }

  it('should properly compile an expired tooltip with communications service', function () {
    var tooltipHtml = $(compileDirective('communications').children().attr('tt-tooltip-unsafe-text'));
    verifyTooltip(tooltipHtml, 'expired', 'call');
  });

  it('should properly compile a trial tooltip with roomSystems service', function () {
    var tooltipHtml = $(compileDirective('roomSystems').children().attr('tt-tooltip-unsafe-text'));
    verifyTooltip(tooltipHtml, 'trial', 'roomSystem');
  });

  it('should properly compile an trial tooltip with sparkBoard service', function () {
    var tooltipHtml = $(compileDirective('sparkBoard').children().attr('tt-tooltip-unsafe-text'));
    verifyTooltip(tooltipHtml, 'trial', 'sparkBoard', true);
  });

  it('should properly compile an active tooltip with conferencing service', function () {
    var tooltipHtml = $(compileDirective('conferencing').children().attr('tt-tooltip-unsafe-text'));
    verifyTooltip(tooltipHtml, 'purchased', 'meeting', true);
  });

  it('should properly compile a free tooltip with messaging service', function () {
    var tooltipHtml = $(compileDirective('messaging').children().attr('tt-tooltip-unsafe-text'));
    verifyTooltip(tooltipHtml, 'free', 'message');
  });

  it('should properly compile a webex tooltip', function () {
    var tooltipHtml = $(compileDirective('webex').children().attr('tt-tooltip-unsafe-text'));
    expect(tooltipHtml.find('.service-name').text()).toEqual('customerPage.webex');
    expect(tooltipHtml.find('.tooltip-block').length).toEqual(1);
    expect(tooltipHtml.find('.tooltip-qty').length).toEqual(1);
    expect(tooltipHtml.find('.service-status').length).toEqual(1);
    expect(tooltipHtml.find('.tooltip-block .tooltip-url').text()).toEqual('example.webex.com');
    expect(tooltipHtml.find('.tooltip-block .tooltip-qty').text()).toEqual('customerPage.quantityWithValue');
    expect(tooltipHtml.find('.tooltip-block i').attr('class')).toContain('trial');
    expect(tooltipHtml.find('.tooltip-block .tooltip-status').text()).toEqual('customerPage.trial');
    expect(tooltipHtml.find('.tooltip-anotherPartner').text()).toEqual('');
  });

  it('should properly compile a broadCloud tooltip for trial broadcloud license', function () {
    scope.mockData = getJSONFixture('core/json/customers/customerWithBroadCloudLicenseAndTrial.json');
    var tooltipHtml = $(compileDirective('communications').children().attr('tt-tooltip-unsafe-text'));
    expect(tooltipHtml.find('.service-name').text()).toEqual('customerPage.call');
    expect(tooltipHtml.find('.service-sub-name').text()).toEqual('customerPage.broadCloud.tootTipTitle');
    expect(tooltipHtml.find('.tooltip-block').length).toEqual(2);
    expect(tooltipHtml.find('.tooltip-qty').length).toEqual(2);
    expect(tooltipHtml.find('.tooltip-block .tooltip-qty').first().text()).toEqual('customerPage.broadCloud.licenseTypeAndValue');
    expect(tooltipHtml.find('.service-status i').attr('class')).toContain('trial');
    expect(tooltipHtml.find('.service-status .tooltip-status').text()).toEqual('customerPage.trial');
  });

  it('should properly compile a broadCloud tooltip for purchased broadcloud license', function () {
    scope.mockData = getJSONFixture('core/json/customers/customerWithBroadCloudLicenseAndNoTrial.json');
    var tooltipHtml = $(compileDirective('communications').children().attr('tt-tooltip-unsafe-text'));
    expect(tooltipHtml.find('.service-name').text()).toEqual('customerPage.call');
    expect(tooltipHtml.find('.service-sub-name').text()).toEqual('customerPage.broadCloud.tootTipTitle');
    expect(tooltipHtml.find('.tooltip-block').length).toEqual(2);
    expect(tooltipHtml.find('.tooltip-qty').length).toEqual(2);
    expect(tooltipHtml.find('.tooltip-block .tooltip-qty').first().text()).toEqual('customerPage.broadCloud.licenseTypeAndValue');
    expect(tooltipHtml.find('.service-status i').attr('class')).toContain('purchased');
    expect(tooltipHtml.find('.service-status .tooltip-status').text()).toEqual('customerPage.purchased');
  });
});
