'use strict';

fdescribe('assignServices', function () {
  var $scope, $state, $httpBackend, $q;
  var view, authinfo, csvDownloadService, hybridService, onboardService, userService;

  var BUCKET = {
    msg: '#messaging',
    conf: '#confirence',
    comm: '#communication'
  };

  var ENT = {
    uc: 'squared-fusion-uc', ec: 'squared-fusion-ec', cal: 'squared-fusion-cal',
    id_uc: '#squared-fusion-uc', id_ec: '#squared-fusion-ec', id_cal: '#squared-fusion-cal'
  };

  var expectCB = function (name, state) {
    return expect(_.find(view.scope().hybridServicesPanelCtrl.extensions, {
      id: name
    }).entitlementState === 'ACTIVE').toBe(state);
  };

  beforeEach(module('Core'));
  beforeEach(module('Hercules'));
  beforeEach(module('Huron'));
  beforeEach(module('Messenger'));

  beforeEach(inject(function ($rootScope, $templateCache, $compile, _$httpBackend_,
    $controller, _$q_, _$state_, _Authinfo_, _CsvDownloadService_, _GroupService_, _HybridService_,
    _OnboardService_, _Orgservice_, _Userservice_) {

    $scope = $rootScope.$new();
    $state = _$state_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;

    authinfo = _Authinfo_;
    csvDownloadService = _CsvDownloadService_;
    hybridService = _HybridService_;
    onboardService = _OnboardService_;
    userService = _Userservice_;

    var services = getJSONFixture('squared/json/services.json');
    var getUserMe = getJSONFixture('core/json/users/me.json');
    var headers = getJSONFixture('core/json/users/headers.json');

    var current = {
      step: {
        name: 'fakeStep'
      }
    };
    $scope.wizard = {};
    $scope.wizard.current = current;

    spyOn(_GroupService_, 'getGroupList').and.callFake(function (callback) {
      callback({});
    });

    spyOn($state, 'go');

    // Authinfo
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
    spyOn(authinfo, 'getOrgId').and.returnValue('12345');
    spyOn(authinfo, 'isPartner').and.returnValue(false);
    spyOn(authinfo, 'getLicenses').and.returnValue([{}]);
    spyOn(authinfo, 'hasAccount').and.returnValue(true);
    spyOn(authinfo, 'getServices').and.returnValue(services);
    spyOn(authinfo, 'isEntitled').and.callFake(function (type) {
      if (type === ENT.cal) return true;
      if (type === ENT.uc) return true;
      if (type === ENT.ec) return true;
      return false;
    });

    spyOn(_Orgservice_, 'getUnlicensedUsers');

    spyOn(userService, 'getUser').and.returnValue(getUserMe);

    spyOn(csvDownloadService, 'getCsv').and.callFake(function (type) {
      if (type === 'headers') {
        return $q.when(headers);
      } else {
        return $q.when({});
      }
    });

    // Localization
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

    // Org info
    $httpBackend
      .when('GET', 'https://identity.webex.com/organization/scim/v1/Orgs/12345')
      .respond({});

    $httpBackend
      .when('GET', 'https://atlas-integration.wbx2.com/admin/api/v1/customers/12345/usage')
      .respond({});

    hybridService.getEntitledExtensions().then(function (extensions) {
      expect(extensions.length).toEqual(3);

      expect(extensions[0].id).toEqual(ENT.cal);
      expect(extensions[0].enabled).toEqual(true);

      expect(extensions[1].id).toEqual(ENT.uc);
      expect(extensions[1].enabled).toEqual(true);

      expect(extensions[2].id).toEqual(ENT.ec);
      expect(extensions[2].enabled).toEqual(true);
    });

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
    //console.log('view html = ' + view.html());
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

  it('should confirm unchecking Call Service Connect does not uncheck Call Service Aware', function() {
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
});
