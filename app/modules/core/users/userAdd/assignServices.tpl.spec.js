
'use strict';

var csvDownloadModule = require('modules/core/csvDownload').default;

describe('assignServices', function () {
  var $scope, $state, $previousState, $httpBackend, $q;
  var view, authinfo, csvDownloadService, CloudConnectorService, FeatureToggleService, Orgservice;

  var orgid = '1';

  var BUCKET = {
    msg: '#paidMsg',
    conf: '#paidMtg',
    comm: '#CO_1',
  };

  var ENT = {
    uc: 'squared-fusion-uc',
    ec: 'squared-fusion-ec',
    cal: 'squared-fusion-cal',
    id_uc: '#squared-fusion-uc',
    id_ec: '#squared-fusion-ec',
    id_cal: '#squared-fusion-cal',
  };

  var ENT_NAMES = {
    'squared-fusion-uc': 'squaredFusionUC',
    'squared-fusion-ec': 'squaredFusionEC',
    'squared-fusion-cal': 'squaredFusionCal',
  };

  var expectCB = function (name, entitled) {
    var entitlement = _.find($scope.hybridServicesPanelCtrl.entitlements, {
      entitlementName: ENT_NAMES[name],
    });
    if (entitled) {
      expect(entitlement).toBeDefined();
      expect(entitlement.entitlementState).toBe('ACTIVE');
    } else {
      expect(entitlement).toBeUndefined();
    }
  };

  afterEach(function () {
    if (view) {
      view.remove();
    }
    view = undefined;
  });

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('Messenger'));
  beforeEach(angular.mock.module('WebExApp'));
  beforeEach(angular.mock.module(csvDownloadModule));

  beforeEach(inject(function ($compile, $rootScope, _$httpBackend_,
    $controller, _$q_, _$state_, _Authinfo_, _CsvDownloadService_,
    _FeatureToggleService_, _Orgservice_, _$previousState_, _CloudConnectorService_) {
    $scope = $rootScope.$new();
    $state = _$state_;
    $previousState = _$previousState_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $previousState = _$previousState_;

    FeatureToggleService = _FeatureToggleService_;
    Orgservice = _Orgservice_;
    authinfo = _Authinfo_;
    csvDownloadService = _CsvDownloadService_;
    CloudConnectorService = _CloudConnectorService_;

    var headers = getJSONFixture('core/json/users/headers.json');
    var accountData = getJSONFixture('core/json/authInfo/msg_mtg_comm_Licenses.json');
    var getLicensesUsage = getJSONFixture('core/json/organizations/usage.json');

    var current = {
      step: {
        name: 'fakeStep',
      },
    };
    $scope.wizard = {};
    $scope.wizard.current = current;

    spyOn($state, 'go');
    spyOn($previousState, 'get').and.returnValue({
      state: {
        name: 'test.state',
      },
    });

    function setupAuthinfo() {
      spyOn(authinfo, 'getConferenceServicesWithoutSiteUrl').and.returnValue([{
        license: {
          siteUrl: 'fakesite1',
        },
      }, {
        license: {
          siteUrl: 'fakesite2',
        },
      }, {
        license: {
          siteUrl: 'fakesite3',
        },
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
    spyOn(Orgservice, 'getLicensesUsage').and.returnValue($q.resolve(getLicensesUsage));
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));
    spyOn(CloudConnectorService, 'getService').and.returnValue($q.resolve({ setup: true }));

    spyOn(csvDownloadService, 'getCsv').and.callFake(function (type) {
      if (type === 'headers') {
        return $q.resolve(headers);
      } else {
        return $q.resolve({});
      }
    });

    $httpBackend.whenGET('https://identity.webex.com/identity/scim/1/v1/Users/me').respond(200, {});
    $httpBackend
      .whenGET('https://cmi.huron-int.com/api/v1/voice/customers/1/sites')
      .respond([{
        mediaTraversalMode: 'TURNOnly',
        siteSteeringDigit: '8',
        vmCluster: null,
        uuid: '70b8d459-7f58-487a-afc8-02c0a82d53ca',
        steeringDigit: '9',
        timeZone: 'America/Los_Angeles',
        voicemailPilotNumberGenerated: 'false',
      }]);

    $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});

    $httpBackend
      .when('GET', 'https://hercules-intb.ciscospark.com/hercules/api/v2/organizations/' + orgid + '/services')
      .respond({
        items: [{
          id: ENT.cal,
          enabled: true,
        }, {
          id: ENT.uc,
          enabled: true,
        }, {
          id: ENT.ec,
          enabled: true,
        }],
      });

    // Org info
    $httpBackend
      .when('GET', 'https://identity.webex.com/organization/scim/v1/Orgs/' + orgid)
      .respond({});

    $httpBackend
      .when('GET', 'https://atlas-intb.ciscospark.com/admin/api/v1/customers/' + orgid + '/usage')
      .respond({});

    $controller('OnboardCtrl', {
      $scope: $scope,
      $state: $state,
    });

    var html = require('modules/core/users/userAdd/assignServices.tpl.html');
    view = $compile(angular.element('<div>').append(html))($scope);
    $scope.$apply();

    // Hybrid controller on child scope, so let's make a reference to it
    $scope.hybridServicesPanelCtrl = $scope.$$childHead.$ctrl;

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
    // Assign at least one paid license to enable the hybrid services panel
    view.find('#paid-msg').click();

    // Click UC
    view.find(ENT.id_uc).click();
    expectCB(ENT.uc, true);
    expectCB(ENT.ec, false);
    view.find(ENT.id_uc).click();
  });

  it('should confirm unchecking Call Service Connect does not uncheck Call Service Aware', function () {
    // Assign at least one paid license to enable the hybrid services panel
    view.find('#paid-msg').click();

    // Click both UC and EC
    view.find(ENT.id_uc).click();
    view.find(ENT.id_ec).click();
    expectCB(ENT.uc, true);
    expectCB(ENT.ec, true);

    // Then unclick EC
    view.find(ENT.id_ec).click();
    expectCB(ENT.uc, true);
    expectCB(ENT.ec, false);
  });

  it('should confirm unchecking Call Service Aware also unchecks Call Service Connect', function () {
    // Assign at least one paid license to enable the hybrid services panel
    view.find('#paid-msg').click();

    // Click UC and EC
    view.find(ENT.id_uc).click();
    view.find(ENT.id_ec).click();
    expectCB(ENT.uc, true);
    expectCB(ENT.ec, true);

    // Unclick UC
    view.find(ENT.id_uc).click();
    expectCB(ENT.uc, false);
    expectCB(ENT.ec, false);
  });

  it('should confirm checking Calendar Service does not affect Call Services', function () {
    // Assign at least one paid license to enable the hybrid services panel
    view.find('#paid-msg').click();

    // Click Cal
    view.find(ENT.id_cal).click();
    expectCB(ENT.cal, true);
    expectCB(ENT.uc, false);
    expectCB(ENT.ec, false);
  });

  it('should confirm checking Huron Call, disabled Call Services Aware', function () {
    // Assign at least one paid license to enable the hybrid services panel
    view.find('#paid-msg').click();

    expect(view.find(BUCKET.comm).is(':disabled')).toBe(false);
    expect(view.find(ENT.id_uc).is(':disabled')).toBe(false);

    // Click Call should disabled Aware and Connect
    view.find(BUCKET.comm).click();
    expect(view.find(ENT.id_uc).is(':disabled')).toBe(true);

    // Unclick Call should enable Aware and Connect
    view.find(BUCKET.comm).click();
    expect(view.find(ENT.id_uc).is(':disabled')).toBe(false);
  });

  it('should confirm checking Call Services Aware disables Huron Call', function () {
    // Assign at least one paid license to enable the hybrid services panel
    view.find('#paid-msg').click();

    expect(view.find(BUCKET.comm).is(':disabled')).toBe(false);
    expect(view.find(ENT.id_uc).is(':disabled')).toBe(false);

    // Clicking UC
    view.find(ENT.id_uc).click();
    expect(view.find(BUCKET.comm).is(':disabled')).toBe(true);

    // Uncheck UC
    view.find(ENT.id_uc).click();
    expect(view.find(BUCKET.comm).is(':disabled')).toBe(false);
  });
});
