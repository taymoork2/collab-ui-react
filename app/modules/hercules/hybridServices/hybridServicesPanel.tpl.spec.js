'use strict';

describe('HybridServicesPanel', function () {
  var view, $scope, $httpBackend, authinfo, Service;
  var ENT = {
    uc: 'squared-fusion-uc',
    ec: 'squared-fusion-ec',
    cal: 'squared-fusion-cal',
    id_uc: '#squared-fusion-uc',
    id_ec: '#squared-fusion-ec',
    id_cal: '#squared-fusion-cal'
  };

  var expectCB = function (name, state) {
    return expect(_.find(view.scope().HybridServicesPanelCtrl.extensions, {
      id: name
    }).entitlementState === 'ACTIVE').toBe(state);
  };

  beforeEach(module('Hercules'));

  beforeEach(function () {
    module(function ($provide) {
      authinfo = {
        getOrgId: sinon.stub(),
        getUserId: sinon.stub(),
        isEntitled: sinon.stub()
      };

      authinfo.getOrgId.returns("12345");
      authinfo.getUserId.returns("collabctg+test@gmail.com");
      authinfo.isEntitled.withArgs(ENT.cal).returns(true);
      authinfo.isEntitled.withArgs(ENT.uc).returns(true);
      authinfo.isEntitled.withArgs(ENT.ec).returns(true);

      $provide.value('Authinfo', authinfo);
    });
  });

  beforeEach(inject(function ($rootScope, $templateCache, $compile, _$httpBackend_, $controller, _HybridService_) {
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    Service = _HybridService_;

    $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});

    // Return such that org has all three Hybrid Services enabled...
    $httpBackend
      .when('GET', 'https://hercules-integration.wbx2.com/v1/organizations/12345/services')
      .respond({
        items: [{
          id: ENT.cal,
          enabled: true,
          acknowledged: false
        }, {
          id: ENT.uc,
          enabled: true,
          acknowledged: false
        }, {
          id: ENT.ec,
          enabled: true,
          acknowledged: false
        }]
      });

    Service.getEntitledExtensions().then(function (extensions) {
      expect(extensions.length).toEqual(3);

      expect(extensions[0].id).toEqual(ENT.cal);
      expect(extensions[0].enabled).toEqual(true);

      expect(extensions[1].id).toEqual(ENT.uc);
      expect(extensions[1].enabled).toEqual(true);

      expect(extensions[2].id).toEqual(ENT.ec);
      expect(extensions[2].enabled).toEqual(true);
    });

    var myCtrl = $controller('HybridServicesPanelCtrl', {
      $scope: $scope,
      $rootScope: $rootScope,
      $modalInstance: {}
    });

    $scope.HybridServicesPanelCtrl = myCtrl;

    $httpBackend.flush();
    $scope.$digest();

    var html = $templateCache.get("modules/hercules/hybridServices/hybridServicesPanel.tpl.html");
    view = $compile(angular.element('<div>').append(html))($scope);
    $scope.$apply();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should confirm all checkboxes unchecked', function () {
    // All checkboxes default to unchecked
    expectCB(ENT.uc, false);
    expectCB(ENT.ec, false);
    expectCB(ENT.cal, false);
  });

  it('should confirm checking Call Service Aware only affects Call Service Aware', function () {
    var ctrl = view.scope().HybridServicesPanelCtrl;

    // Click UC
    view.find(ENT.id_uc).click();
    expectCB(ENT.uc, true);
    expectCB(ENT.ec, false);
    view.find(ENT.id_uc).click();
  });

  it('should confirm checking Call Service Connect also checks Call Service Connect', function () {
    var ctrl = view.scope().HybridServicesPanelCtrl;

    // Click EC
    view.find(ENT.id_ec).click();
    expectCB(ENT.uc, true);
    expectCB(ENT.ec, true);

    // Unclick EC
    view.find(ENT.id_ec).click();
    expectCB(ENT.uc, true);
    expectCB(ENT.ec, false);

    // Unclick UC
    view.find(ENT.id_uc).click();
  });

  it('should confirm unchecking Call Service Connect also unchecks Call Service Connect', function () {
    var ctrl = view.scope().HybridServicesPanelCtrl;

    // Click EC
    view.find(ENT.id_ec).click();
    expectCB(ENT.uc, true);
    expectCB(ENT.ec, true);

    // Unclick UC
    view.find(ENT.id_uc).click();
    expectCB(ENT.uc, false);
    expectCB(ENT.ec, false);
  });

  it('should confirm checking Calendar Service does affect Call Services', function () {
    var ctrl = view.scope().HybridServicesPanelCtrl;

    // Click Cal
    view.find(ENT.id_cal).click();
    expectCB(ENT.cal, true);
    expectCB(ENT.uc, false);
    expectCB(ENT.ec, false);
  });
});
