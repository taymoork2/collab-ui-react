import mediaOnHoldModule from './index';
import { IOption } from 'modules/huron/dialing';

describe('Service: MediaOnHoldService', () => {
  beforeEach(function() {
    this.initModules(mediaOnHoldModule);
    this.injectDependencies(
      '$httpBackend',
      '$q',
      'Authinfo',
      '$translate',
      'HuronConfig',
      'MediaOnHoldService',
      'FeatureToggleService',
    );
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
    this.MEDIA_FILE_ID_1 = '998725e5-a8df-441a-b707-f00e7d7b6501';
    this.MEDIA_FILE_ID_2 = '9cdd6f7b-5814-4edb-9697-a015d7f32b3g';
    this.MEDIA_FILE_ID_3 = 'f03276fe-3ffb-4e94-a3cb-8ef86752eecd';
    this.MEDIA_FILE_NAME_2 = 'filename2';
    this.LOCATION_ID = 'abcd';
    this.LINE_NUM_UUID = 'abcd-12345';
  });

  afterEach(function () {
    this.$httpBackend.flush();
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('Company Media on Hold GET Prompts', function() {
    beforeEach(function() {
      this.mediaOnHoldResponse = getJSONFixture('huron/json/moh/mohPrompts.json');
      this.$httpBackend.expectGET(this.HuronConfig.getMmsUrl() + '/organizations/12345/mohPrompts')
        .respond(this.mediaOnHoldResponse);
      this.GENERIC_MEDIA = <IOption> {
        label: 'System Default',
        value: '98765432-DBC2-01BB-476B-CFAF98765432',
      };
      spyOn(this.$translate, 'instant').and.returnValue('System Default');
    });

    it('getMediaOnHold gets a response', function() {
      this.MediaOnHoldService.getMediaOnHold()
        .then(response => {
          expect(response[0].rhesosId).toEqual(this.MEDIA_FILE_ID_1);
          expect(response[1].displayName).toEqual(this.MEDIA_FILE_NAME_2);
        });
    });

    it('getCompanyMedia should return assigned company Media', function() {
      this.MediaOnHoldService.getCompanyMedia()
        .then(response => {
          expect(response).toEqual(this.MEDIA_FILE_ID_1);
        });
    });

    it('getCompanyMohOptions should return Media on Hold Options', function() {
      this.MediaOnHoldService.getCompanyMohOptions()
        .then(response => {
          expect(response.length).toBe(4);
          expect(response).toContain(this.GENERIC_MEDIA);
        });
    });
  });

  describe('Location Media on Hold', function() {
    beforeEach(function() {
      this.locationMediaOnHoldResponse = getJSONFixture('huron/json/moh/mohPrompts.json');
      this.$httpBackend.expectGET(this.HuronConfig.getMmsUrl() + '/organizations/12345/mohPrompts')
        .respond(this.locationMediaOnHoldResponse);
      this.LOCATION_GENERIC_MEDIA = <IOption> {
        label: 'Company MOH (filename1)',
        value: '98765432-DBC2-01BB-476B-CFAF98765432',
      };
      spyOn(this.$translate, 'instant').and.returnValue('Company MOH');
    });

    it('getLocationMedia should return assigned Location Media', function() {
      this.MediaOnHoldService.getLocationMedia(this.LOCATION_ID)
        .then(response => {
          expect(response).toEqual(this.MEDIA_FILE_ID_2);
        });
    });

    it('getLocationMohOptions should return Location level Media on Hold Options', function() {
      this.MediaOnHoldService.getLocationMohOptions()
        .then(response => {
          expect(response.length).toBe(4);
          expect(response).toContain(this.LOCATION_GENERIC_MEDIA);
        });
    });
  });

  describe('Line Media on Hold', function() {
    beforeEach(function() {
      this.lineMediaOnHoldResponse = getJSONFixture('huron/json/moh/mohPrompts.json');
      this.$httpBackend.expectGET(this.HuronConfig.getMmsUrl() + '/organizations/12345/mohPrompts')
        .respond(this.lineMediaOnHoldResponse);
      this.LINE_GENERIC_MEDIA = <IOption> {
        label: 'Location MOH (filename2)',
        value: '98765432-DBC2-01BB-476B-CFAF98765432',
      };
      spyOn(this.$translate, 'instant').and.returnValue('Location MOH');
    });

    it('getLineMedia should return assigned Line Media', function() {
      this.MediaOnHoldService.getLineMedia(this.LINE_NUM_UUID)
        .then(response => {
          expect(response).toEqual(this.MEDIA_FILE_ID_3);
        });
    });

    it('getLineMohOptions should return Line level Media on Hold Options', function() {
      this.MediaOnHoldService.getLineMohOptions()
        .then(response => {
          expect(response.length).toBe(4);
          expect(response).toContain(this.LINE_GENERIC_MEDIA);
        });
    });
  });

  describe('Assigning Media on Hold File', function() {
    beforeEach(function() {
      this.$httpBackend.expectPOST(this.HuronConfig.getMmsUrl() + '/organizations/12345/mohPrompts')
        .respond(200, {
          promptId: '9876-zyxw',
        });
      this.PROMPT_ID = '9876-zyxw';
    });

    it('should perform Company level assignment', function() {
      this.MediaOnHoldService.updateMediaOnHold(this.MEDIA_FILE_ID_2)
        .then(response => {
          expect(response.promptId).toEqual(this.PROMPT_ID);
        });
    });

    it('should perform Location level assignment', function() {
      this.MediaOnHoldService.updateMediaOnHold(this.MEDIA_FILE_ID_2, this.LOCATION_ID)
        .then(response => {
          expect(response.promptId).toEqual(this.PROMPT_ID);
        });
    });

    it('should perform Line level assignment', function() {
      this.MediaOnHoldService.updateMediaOnHold(this.MEDIA_FILE_ID_2, this.LINE_NUM_UUID)
        .then(response => {
          expect(response.promptId).toEqual(this.PROMPT_ID);
        });
    });
  });

  describe('Unassigning Media on Hold File', function() {
    beforeEach(function() {
      this.$httpBackend.expectPOST(this.HuronConfig.getMmsUrl() + '/organizations/12345/mohPrompts')
        .respond(200, {
          promptId: '06691d80-01e7-4e05-b869-8fa680822c51',
        });
      this.PROMPT_ID = '06691d80-01e7-4e05-b869-8fa680822c51';
    });

    it('should perform Company level unassignment', function() {
      this.MediaOnHoldService.unassignMediaOnHold()
        .then(response => {
          expect(response.promptId).toBe(this.PROMPT_ID);
        });
    });

    it('should perform Location level unassignment', function() {
      this.MediaOnHoldService.unassignMediaOnHold('Location', this.LOCATION_ID)
        .then(response => {
          expect(response.promptId).toBe(this.PROMPT_ID);
        });
    });

    it('should perform Line level unassignment', function() {
      this.MediaOnHoldService.updateMediaOnHold('Line', this.LINE_NUM_UUID)
        .then(response => {
          expect(response.promptId).toBe(this.PROMPT_ID);
        });
    });
  });
});
