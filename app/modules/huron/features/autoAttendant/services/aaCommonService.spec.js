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

      it('all is valid by default', function () {
        expect(AACommonService.isValid()).toBeTruthy();
      });

      it('is valid or invalid as set with one item', function () {
        AACommonService.setIsValid("1", false);
        expect(AACommonService.isValid()).toBeFalsy();

        AACommonService.setIsValid("1", true);
        expect(AACommonService.isValid()).toBeTruthy();
      });

      it('is valid or invalid as set for multiple items', function () {
        AACommonService.setIsValid("1", false);
        expect(AACommonService.isValid()).toBeFalsy();

        AACommonService.setIsValid("1", true);
        expect(AACommonService.isValid()).toBeTruthy();

        AACommonService.setIsValid("1", false);
        AACommonService.setIsValid("2", false);
        expect(AACommonService.isValid()).toBeFalsy();

        AACommonService.setIsValid("1", true);
        expect(AACommonService.isValid()).toBeFalsy();

        AACommonService.setIsValid("2", true);
        expect(AACommonService.isValid()).toBeTruthy();

      });

    });

  });
