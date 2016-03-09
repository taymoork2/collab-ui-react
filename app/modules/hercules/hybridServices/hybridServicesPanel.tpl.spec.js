'use strict';

fdescribe('servicesPanelsView', function () {
  var view, ctrl, $scope, $httpBackend, authinfo, Service;
  var ENT = {
    uc: 'squared-fusion-uc',
    ec: 'squared-fusion-ec',
    cal: 'squared-fusion-cal'
  };

  beforeEach(module('wx2AdminWebClientApp'));

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

    ctrl = $controller('HybridServicesPanelCtrl', {
      $scope: $scope,
      $rootScope: $rootScope,
      $modalInstance: {}
    });

    $scope.HybridServicesPanelCtrl = ctrl;

    $httpBackend.flush();
    $scope.$digest();

    var html = $templateCache.get("modules/hercules/hybridServices/hybridServicesPanel.tpl.html");
    view = $compile(angular.element(html))($scope);
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should confirm checkbox UX logic', function () {
    console.log('ctrl is ' + ctrl );
    console.log('html is ' + view.html() );
    console.log('ent.uc is ' + ENT.uc + ' val ' + view.find(ENT.uc).checked );
    expect(view.find(ENT.uc).checked).toBe(false);
  });
});