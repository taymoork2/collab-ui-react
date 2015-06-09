'use strict';

describe('NoServiceConnectorsEnabledDirective', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $compile, $scope, converterService;
  beforeEach(inject(function ($injector, _$compile_, $rootScope, _ConverterService_) {
    $compile = _$compile_;
    $scope = $rootScope.$new();
    $injector.get('$httpBackend').when('GET', 'l10n/en_US.json').respond({});
    converterService = _ConverterService_;
  }));

  it('hides the element when no clusters fused', function () {
    $scope.clusters = [];
    var element = $compile("<hercules-no-service-connectors-enabled>")($scope);
    $scope.$digest();
    expect(element.find('#noServiceConnectorsEnabledAction').hasClass('ng-hide')).toBe(true);
  });

  it('hides the element when service connectors are enabled', function () {
    $scope.clusters = converterService.convertClusters([{
      "id": "d5b78711-b132-11e4-8a66-005056000340",
      "cluster_type": "c_mgmt",
      "name": "gwydlvm340",
      "services": [{
        "service_type": "c_mgmt",
        "enabled": true,
        "display_name": "Management Connector",
        "connectors": [{
          "host": {
            "host_name": "hostname.cisco.com",
            "serial": "12345"
          },
          "state": "running"
        }]
      }, {
        "service_type": "c_cal",
        "enabled": true,
        "display_name": "Calendar Connector",
        "connectors": [{
          "host": {
            "host_name": "hostname.cisco.com",
            "serial": "12345"
          },
          "state": "running"
        }]
      }]
    }]);
    var element = $compile("<hercules-no-service-connectors-enabled>")($scope);
    $scope.$digest();
    expect(element.find('#noServiceConnectorsEnabledAction').hasClass('ng-hide')).toBe(true);
  });

  it('replaces the element with the appropriate content when there are no service connectors fused', function () {
    $scope.clusters = converterService.convertClusters([{
      "id": "d5b78711-b132-11e4-8a66-005056000340",
      "cluster_type": "c_mgmt",
      "name": "gwydlvm340",
      "services": [{
        "service_type": "c_mgmt",
        "enabled": true,
        "display_name": "Management Connector",
        "connectors": [{
          "host": {
            "host_name": "hostname.cisco.com",
            "serial": "12345"
          },
          "state": "running"
        }]
      }, {
        "service_type": "c_cal",
        "enabled": true,
        "display_name": "Calendar Connector",
        "connectors": [{
          "host": {
            "host_name": "hostname.cisco.com",
            "serial": "12345"
          },
          "state": "disabled"
        }]
      }]
    }]);
    var element = $compile("<hercules-no-service-connectors-enabled>")($scope);
    $scope.$digest();
    expect(element.find('#noServiceConnectorsEnabledAction').hasClass('ng-hide')).toBe(false);
    expect(element.html()).toContain("No Service Connectors Enabled");
  });
});
