'use strict';

var csvDownloadModule = require('modules/core/csvDownload').default;

describe('Template: editServices', function () {
  var SAVE_BUTTON = '#btnSaveEnt';
  var userId = 'dbca1001-ab12-cd34-de56-abcdef123454';

  function init() {
    this.initModules('Core', 'Hercules', 'Huron', 'Messenger', 'Sunlight', 'WebExApp', csvDownloadModule);
    this.injectDependencies('$httpBackend', '$q', '$previousState', 'CsvDownloadService', 'FeatureToggleService', 'Orgservice', 'UrlConfig');
    initDependencySpies.apply(this);
    this.compileViewTemplate('OnboardCtrl', require('modules/core/users/userOverview/editServices.tpl.html'));
  }

  function initDependencySpies() {
    this.mock = {};
    this.mock.fusionServices = getJSONFixture('core/json/authInfo/fusionServices.json');
    this.mock.headers = getJSONFixture('core/json/users/headers.json');
    this.mock.getLicensesUsage = getJSONFixture('core/json/organizations/usage.json');

    spyOn(this.CsvDownloadService, 'getCsv').and.callFake(function (type) {
      if (type === 'headers') {
        return this.$q.resolve(this.mock.headers);
      } else {
        return this.$q.resolve({});
      }
    }.bind(this));
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
    spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.resolve(this.mock.getLicensesUsage));
    spyOn(this.Orgservice, 'getUnlicensedUsers');
    spyOn(this.$previousState, 'get').and.returnValue({
      state: {
        name: 'test.state',
      },
    });
    this.$httpBackend.expectGET(this.UrlConfig.getSunlightConfigServiceUrl() + '/user/' + userId).respond(200);
    this.$httpBackend
      .whenGET('https://cmi.huron-int.com/api/v1/voice/customers/sites')
      .respond([{
        mediaTraversalMode: 'TURNOnly',
        siteSteeringDigit: '8',
        vmCluster: null,
        uuid: '70b8d459-7f58-487a-afc8-02c0a82d53ca',
        steeringDigit: '9',
        timeZone: 'America/Los_Angeles',
        voicemailPilotNumberGenerated: 'false',
      }]);
  }

  function initSpies() {
    spyOn(this.$scope, 'editServicesSave');
  }

  beforeEach(init);
  beforeEach(initSpies);

  describe('Save button', function () {
    it('should call editServicesSave() on click', function () {
      this.view.find(SAVE_BUTTON).click();
      expect(this.$scope.editServicesSave).toHaveBeenCalled();
    });
  });
});
