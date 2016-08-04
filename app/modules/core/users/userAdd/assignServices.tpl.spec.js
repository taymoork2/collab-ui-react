'use strict';

describe('assignServices', function () {
  var $scope, $state, $previousState, $httpBackend, $q;
  var view, authinfo, csvDownloadService, hybridService, Orgservice, Userservice, FeatureToggleService, WebExUtilsFact;

  var orgid = '1';

  var BUCKET = {
    msg: '#paidMsg',
    conf: '#paidMtg',
    comm: '#CO_1'
  };

  var ENT = {
    uc: 'squared-fusion-uc',
    ec: 'squared-fusion-ec',
    cal: 'squared-fusion-cal',
    id_uc: '#squared-fusion-uc',
    id_ec: '#squared-fusion-ec',
    id_cal: '#squared-fusion-cal'
  };

  var expectCB = function (name, state) {
    return expect(_.find(view.scope().hybridServicesPanelCtrl.extensions, {
      id: name
    }).entitlementState === 'ACTIVE').toBe(state);
  };

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('Messenger'));
  beforeEach(angular.mock.module('WebExApp'));

  beforeEach(inject(function ($compile, $rootScope, $templateCache, _$httpBackend_,
    $controller, _$q_, _$state_, _Authinfo_, _CsvDownloadService_, _HybridService_, _FeatureToggleService_,
    _Orgservice_, _Userservice_, _$previousState_, _WebExUtilsFact_) {

    $scope = $rootScope.$new();
    $state = _$state_;
    $previousState = _$previousState_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $previousState = _$previousState_;

    Orgservice = _Orgservice_;
    Userservice = _Userservice_;
    authinfo = _Authinfo_;
    csvDownloadService = _CsvDownloadService_;
    hybridService = _HybridService_;
    WebExUtilsFact = _WebExUtilsFact_;
    FeatureToggleService = _FeatureToggleService_;

    var getUserMe = getJSONFixture('core/json/users/me.json');
    var headers = getJSONFixture('core/json/users/headers.json');
    var accountData = getJSONFixture('core/json/authInfo/msg_mtg_comm_Licenses.json');
    var getLicensesUsage = getJSONFixture('core/json/organizations/usage.json');

    var current = {
      step: {
        name: 'fakeStep'
      }
    };
    $scope.wizard = {};
    $scope.wizard.current = current;

    spyOn($state, 'go');
    spyOn($previousState, 'get').and.returnValue({
      state: {
        name: 'test.state'
      }
    });

    function setupAuthinfo() {
      spyOn(authinfo, 'getConferenceServicesWithoutSiteUrl').and.returnValue([{
        license: {
          siteUrl: 'fakesite1'
        }
      }, {
        license: {
          siteUrl: 'fakesite2'
        }
      }, {
        license: {
          siteUrl: 'fakesite3'
        }
      }]);
      spyOn(authinfo, 'getOrgId').and.returnValue(orgid);
      spyOn(authinfo, 'isInitialized').and.returnValue(true);
      spyOn(authinfo, 'isPartner').and.returnValue(false);
      spyOn(authinfo, 'hasAccount').and.returnValue(true);
      // Required to show Huron Call checkbox
      spyOn(authinfo, 'isSetupDone').and.returnValue(true);
      spyOn(authinfo, 'isEntitled').and.callFake(function (type) {
        if (type === ENT.cal) return true;
        if (type === ENT.uc) return true;
        if (type === ENT.ec) return true;
        return false;
      });
    }
    setupAuthinfo();
    authinfo.updateAccountInfo(accountData);

    spyOn(_Orgservice_, 'getUnlicensedUsers');
    spyOn(_FeatureToggleService_, 'atlasCareTrialsGetStatus').and.returnValue($q.resolve(false));
    spyOn(Orgservice, 'getLicensesUsage').and.returnValue($q.when(getLicensesUsage));
    spyOn(FeatureToggleService, 'supportsDirSync').and.returnValue($q.when(false));

    spyOn(csvDownloadService, 'getCsv').and.callFake(function (type) {
      if (type === 'headers') {
        return $q.when(headers);
      } else {
        return $q.when({});
      }
    });

    $httpBackend.whenGET('https://identity.webex.com/identity/scim/1/v1/Users/me').respond(200, {});

    $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});

    function setupHybridServices() {
      $httpBackend
        .when('GET', 'https://hercules-integration.wbx2.com/v1/organizations/' + orgid + '/services')
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

      hybridService.getEntitledExtensions().then(function (extensions) {
        expect(extensions.length).toEqual(3);

        expect(extensions[0].id).toEqual(ENT.cal);
        expect(extensions[0].enabled).toEqual(true);

        expect(extensions[1].id).toEqual(ENT.uc);
        expect(extensions[1].enabled).toEqual(true);

        expect(extensions[2].id).toEqual(ENT.ec);
        expect(extensions[2].enabled).toEqual(true);
      });
    }
    setupHybridServices();

    // Org info
    $httpBackend
      .when('GET', 'https://identity.webex.com/organization/scim/v1/Orgs/' + orgid)
      .respond({});

    $httpBackend
      .when('GET', 'https://atlas-integration.wbx2.com/admin/api/v1/customers/' + orgid + '/usage')
      .respond({});

    $controller('OnboardCtrl', {
      $scope: $scope,
      $state: $state
    });

    var html = $templateCache.get("modules/core/users/userAdd/assignServices.tpl.html");
    view = $compile(angular.element('<div>').append(html))($scope);
    $scope.$apply();

    // Hybrid controller on child scope, so let's make a reference to it
    $scope.hybridServicesPanelCtrl = $scope.$$childHead.hybridServicesPanelCtrl;

    $httpBackend.flush();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should confirm all buckets present', function () {
    expect(view.find(BUCKET.msg)).toBeDefined();
    expect(view.find(BUCKET.conf)).toBeDefined();
    expect(view.find(BUCKET.comm)).toBeDefined();
  });

  it('should confirm all checkboxes unchecked', function () {
    // All checkboxes default to unchecked
    expectCB(ENT.uc, false);
    expectCB(ENT.ec, false);
    expectCB(ENT.cal, false);
  });

  it('should confirm checking Call Service Aware only affects Call Service Aware', function () {
    // Click UC
    view.find(ENT.id_uc).click();
    expectCB(ENT.uc, true);
    expectCB(ENT.ec, false);
    view.find(ENT.id_uc).click();
  });

  it('should confirm checking Call Service Connect also checks Call Service Connect', function () {
    // Click EC
    view.find(ENT.id_ec).click();
    expectCB(ENT.uc, true);
    expectCB(ENT.ec, true);
  });

  it('should confirm unchecking Call Service Connect does not uncheck Call Service Aware', function () {
    // First click EC
    view.find(ENT.id_ec).click();
    expectCB(ENT.uc, true);
    expectCB(ENT.ec, true);

    // Then unclick EC
    view.find(ENT.id_ec).click();
    expectCB(ENT.uc, true);
    expectCB(ENT.ec, false);
  });

  it('should confirm unchecking Call Service Aware also unchecks Call Service Connect', function () {
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
    // Click Cal
    view.find(ENT.id_cal).click();
    expectCB(ENT.cal, true);
    expectCB(ENT.uc, false);
    expectCB(ENT.ec, false);
  });

  it('should confirm checking Huron Call, disabled Call Services Aware and Connect', function () {
    expect(view.find(BUCKET.comm).is(':disabled')).toBe(false);
    expect(view.find(ENT.id_uc).is(':disabled')).toBe(false);
    expect(view.find(ENT.id_ec).is(':disabled')).toBe(false);

    // Click Call should disabled Aware and Connect
    view.find(BUCKET.comm).click();
    expect(view.find(ENT.id_uc).is(':disabled')).toBe(true);
    expect(view.find(ENT.id_ec).is(':disabled')).toBe(true);

    // Unclick Call should enable Aware and Connect
    view.find(BUCKET.comm).click();
    expect(view.find(ENT.id_uc).is(':disabled')).toBe(false);
    expect(view.find(ENT.id_ec).is(':disabled')).toBe(false);
  });

  it('should confirm checking either Call Services Aware or Connect disables Huron Call', function () {
    expect(view.find(BUCKET.comm).is(':disabled')).toBe(false);
    expect(view.find(ENT.id_uc).is(':disabled')).toBe(false);
    expect(view.find(ENT.id_ec).is(':disabled')).toBe(false);

    // Clicking Connect (also checks Aware)
    view.find(ENT.id_ec).click();
    expect(view.find(BUCKET.comm).is(':disabled')).toBe(true);

    // Uncheck Connect, which leaves Aware on
    view.find(ENT.id_ec).click();
    expect(view.find(BUCKET.comm).is(':disabled')).toBe(true);

    // Uncheck Aware, which should activate Call
    view.find(ENT.id_uc).click();
    expect(view.find(BUCKET.comm).is(':disabled')).toBe(false);
  });
});
