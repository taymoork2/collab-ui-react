  'use strict';

  describe('Service:AACommonService', function () {

    var AACommonService;
    beforeEach(module('uc.autoattendant'));
    beforeEach(module('Huron'));

    beforeEach(inject(function (_AACommonService_) {
      AACommonService = _AACommonService_;
    }));

    afterEach(function () {

    });

    describe('AACommonService services', function () {

      it('setSayMessageStatus should set to false', function () {
        AACommonService.setSayMessageStatus(false);
        expect(AACommonService.isFormDirty()).toBeFalsy();
      });

      it('setSayMessageStatus should set to true', function () {
        AACommonService.setSayMessageStatus(true);
        expect(AACommonService.isFormDirty()).toBeTruthy();
      });

      it('resetFormStatus should reset the flags', function () {
        AACommonService.resetFormStatus();
        expect(AACommonService.isFormDirty()).toBeFalsy();
      });

      it('setPhoneMenuStatus should be true', function () {
        AACommonService.setPhoneMenuStatus(true);
        expect(AACommonService.isFormDirty()).toBeTruthy();
      });

      it('setPhoneMenuStatus should be false', function () {
        AACommonService.setPhoneMenuStatus(false);
        expect(AACommonService.isFormDirty()).toBeFalsy();
      });

    });

  });
