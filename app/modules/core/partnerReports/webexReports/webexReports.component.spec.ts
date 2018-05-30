import webexReports from './index';

describe('Component: webexReports', function () {
  beforeEach(function () {
    this.initModules(webexReports);
    this.injectDependencies('$rootScope', '$q', '$scope', '$state', '$componentController', 'FeatureToggleService', 'Notification');

    this.testData = {
      orgInfo: {
        orgId: 'ad270e7d-3051-45d6-ad98-ddda569d944d',
        email: 'pda201709@yopmail.com',
      },
      atlasPartnerWebexReportsEnabled: true,
      qbsResponse: {
        appName: 'webex_report_partner',
        ticket: 'WEFD7zdFlsdhfE',
        host: 'qlik-engine2',
        isPersistent: true,
        vID: '',
      },
    };
    const Authinfo = {
      getOrgId: jasmine.createSpy('getOrgId').and.returnValue(this.testData.orgInfo.orgId),
      getPrimaryEmail: jasmine.createSpy('getPrimaryEmail').and.returnValue(this.testData.orgInfo.email),
    };
    const QlikService = {
      getQBSInfo: () => {
        return this.$q.resolve(this.testData.qbsResponse);
      },
      getQlikMashupUrl: () => {
        return 'qlik-test.cisco.com';
      },
    };
    spyOn(this.FeatureToggleService, 'atlasPartnerWebexReportsGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.$rootScope, '$broadcast').and.callThrough();
    spyOn(this.$state, 'go');
    spyOn(this.Notification, 'errorWithTrackingId');

    this.controller = this.$componentController('webexReports', {
      $rootScope: this.$rootScope,
      $q: this.$q,
      $scope: this.$scope,
      $sce: this.$sce,
      $state: this.$state,
      Authinfo: Authinfo,
      FeatureToggleService: this.FeatureToggleService,
      QlikService: QlikService,
      Notification: this.Notification,
    });
    this.controller.$onInit();
    this.$scope.$apply();
  });

  it('should load the report when the feaature toggle enabled', function () {
    expect(this.$rootScope.$broadcast).toHaveBeenCalled();
  });
});
