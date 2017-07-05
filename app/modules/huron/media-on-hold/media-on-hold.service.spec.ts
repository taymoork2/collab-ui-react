import mediaOnHoldModule from './index';
import { IOption } from 'modules/huron/dialing';

describe('Service: MediaOnHoldService', () => {
  beforeEach(function() {
    this.initModules(mediaOnHoldModule);
    this.injectDependencies(
      '$httpBackend',
      'Authinfo',
      'HuronConfig',
      'MediaOnHoldService',
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
    this.MEDIA_FILE_ID_1 = '998725e5-a8df-441a-b707-f00e7d7b6501';
    this.MEDIA_FILE_ID_2 = '9cdd6f7b-5814-4edb-9697-a015d7f32b3g';
    this.MEDIA_FILE_ID_3 = 'f03276fe-3ffb-4e94-a3cb-8ef86752eecd';
    this.MEDIA_FILE_NAME_2 = 'filename2';
    this.LINE_NUM_UUID = 'abcd-1234';
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
        label: 'Generic Media',
        value: '1',
      };
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

  describe('Line Media on Hold', function() {
    beforeEach(function() {
      this.lineMediaOnHoldResponse = getJSONFixture('huron/json/moh/lineMohPrompts.json');
      this.$httpBackend.expectGET(this.HuronConfig.getMmsUrl() + '/organizations/12345/mohPrompts/lines/' + this.LINE_NUM_UUID)
        .respond(this.lineMediaOnHoldResponse);
    });

    it('getLineMediaOnHold gets a response', function() {
      this.MediaOnHoldService.getLineMediaOnHold(this.LINE_NUM_UUID)
        .then(response => {
          expect(response[0].rhesosId).toEqual(this.MEDIA_FILE_ID_1);
          expect(response[1].displayName).toEqual(this.MEDIA_FILE_NAME_2);
        });
    });

    it('getLineMedia should return assigned Line Media', function() {
      this.MediaOnHoldService.getLineMedia(this.LINE_NUM_UUID)
        .then(response => {
          expect(response).toEqual(this.MEDIA_FILE_ID_3);
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

    it('should perform Line level assignment', function() {
      this.MediaOnHoldService.updateMediaOnHold(this.MEDIA_FILE_ID_2, this.LINE_NUM_UUID)
        .then(response => {
          expect(response.promptId).toEqual(this.PROMPT_ID);
        });
    });
  });
});

