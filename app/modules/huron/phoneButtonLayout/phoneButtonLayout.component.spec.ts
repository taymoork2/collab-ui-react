import { IPhoneButton } from './phoneButtonLayout.service';
import { KeyCodes } from 'modules/core/accessibility';

describe('component: phoneButtonLayout', () => {
  const DROPDOWN_LIST = 'button[cs-dropdown-toggle]';
  const DROPDOWN_LIST_ADD = '.actions-services li:nth-child(1)';

  const INPUT_NAME = 'input[name="buttonLabel"]';
  const INPUT_NUMBER = 'input[name="phoneinput"]';
  const SAVE_BUTTON = 'button.btn--primary';
  const READ_ONLY = '.phonebuttonlayout-readonly-wrapper .phonebutton-label';
  const DROPDOWN_LIST_REORDER = '.actions-services li:nth-child(2)';
  const REORDER = '.phonebuttonlayout-reorder';

  beforeEach(function() {
    this.initModules('huron.phone-button-layout');
    this.injectDependencies(
      '$httpBackend',
      '$q',
      '$scope',
      '$timeout',
      'Authinfo',
      'BlfInternalExtValidation',
      'BlfURIValidation',
      'DraggableService',
      'FeatureMemberService',
      'HuronConfig',
      'HuronCustomerService',
      'HuronUserService',
      'Notification',
      'PhoneButtonLayoutService',
      'UrlConfig',
    );
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
    this.callDestInputs = ['external', 'uri', 'custom'];
    this.firstReordering = true;
    this.editing = false;
    this.reordering = false;
    this.callDest = { phonenumber: '1234' };
    spyOn(this.PhoneButtonLayoutService, 'getPhoneButtons').and.returnValue(this.$q.resolve({
      buttonLayout: [],
    }));
    spyOn(this.PhoneButtonLayoutService, 'updatePhoneButtons').and.returnValue(this.$q.resolve());
    spyOn(this.FeatureMemberService, 'getMachineAcct').and.returnValue(this.$q.resolve());
    spyOn(this.HuronUserService, 'getFullNameFromUser').and.returnValue(this.$q.resolve({ user: { displayName: 'John Doe' } }));
    spyOn(this.HuronUserService, 'getUserV2').and.returnValue(this.$q.resolve());
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('123');
    spyOn(this.HuronCustomerService, 'getVoiceCustomer').and.returnValue(this.$q.resolve({ uuid: '123', dialingPlanDetails: { regionCode: '', countryCode: '+1' } }));
    spyOn(this.Notification, 'success');
    this.$httpBackend.whenGET(this.UrlConfig.getScimUrl(this.Authinfo.getOrgId()) + '/12345').respond(200);
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  function initComponent(ownerType, ownerId) {

    return function() {
      this.compileComponent('ucPhoneButtonLayout', {
        ownerType: ownerType,
        ownerId: ownerId,
      });
      this.$scope.$apply();
    };
  }

  describe('UI', () => {
    beforeEach(initComponent('users', '12345'));
    it('should have phone buttons add functionality', function () {
      this.view.find(DROPDOWN_LIST).click();
      this.view.find(DROPDOWN_LIST_ADD).click();
      expect(this.view.find(INPUT_NAME)).toExist();
      expect(this.view.find(SAVE_BUTTON)).toBeDisabled();
      this.view.find(INPUT_NAME).val('Paul').change();
      this.view.find(INPUT_NUMBER).val('+1 214-781-8900').change();
      expect(this.view.find(SAVE_BUTTON)).not.toBeDisabled();
      this.view.find(SAVE_BUTTON).click();
      expect(this.view.find(READ_ONLY).get(0)).toHaveText('Paul');
    });

    it('should have phone buttons reorder functionality', function () {
      this.view.find(DROPDOWN_LIST).click();
      this.view.find(DROPDOWN_LIST_ADD).click();
      this.view.find(INPUT_NAME).val('Home').change();
      this.view.find(INPUT_NUMBER).val('+1 214-345-3234').change();
      this.view.find(SAVE_BUTTON).click();
      expect(this.view.find(REORDER).get(0)).not.toExist();
      this.view.find(DROPDOWN_LIST).click();
      this.view.find(DROPDOWN_LIST_REORDER).click();
      expect(this.view.find(REORDER).get(0)).toExist();
    });
  });

  describe('Initialize component with places', () => {
    beforeEach(initComponent('places', '54321'));

    it('should set owner details and load phone buttons for places', function () {
      expect(this.PhoneButtonLayoutService.getPhoneButtons).toHaveBeenCalledWith('places', 54321);
      expect(this.FeatureMemberService.getMachineAcct).toHaveBeenCalled();
    });

    afterEach(function () {
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    });
  });

  describe('cs-call-destination component', () => {
    let modelnumber, modeluri;
    beforeEach(initComponent('users', '12345'));
    beforeEach(function () {
      modelnumber = '789';
      modeluri = 'test@cisco';
      spyOn(this.controller, 'extensionOwned').and.callThrough();
    });

    afterEach(function () {
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    });

    it('should have have blf enabled for valid number', function () {
      this.controller.optionSelected = 'custom';
      this.$httpBackend.whenGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/validate/internalextension?value=789').respond(200);
      this.controller.setPhoneButton(modelnumber);
      this.$timeout.flush();
      this.$httpBackend.flush();
      expect(this.controller.extension).toEqual('789');
      expect(this.controller.isValid).toBeTruthy();
    });

    it('should have have blf disabled for invalid number', function () {
      this.controller.optionSelected = 'custom';
      this.$httpBackend.whenGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/validate/internalextension?value=789').respond(500);
      this.controller.setPhoneButton(modelnumber);
      this.$timeout.flush();
      this.$httpBackend.flush();
      expect(this.controller.isValid).toBeFalsy();
    });

    it('should have have blf enabled for valid uri', function () {
      this.controller.optionSelected = 'uri';
      this.$httpBackend.whenGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/validate/uri?value=test@cisco').respond(200);
      this.controller.setPhoneButton(modeluri);
      this.$timeout.flush();
      this.$httpBackend.flush();
      expect(this.controller.isValid).toBeTruthy();
    });

    it('should have have blf disabled for invalid uri', function () {
      this.controller.optionSelected = 'uri';
      this.$httpBackend.whenGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/validate/uri?value=test@cisco').respond(500);
      this.controller.setPhoneButton(modeluri);
      this.$timeout.flush();
      this.$httpBackend.flush();
      expect(this.controller.isValid).toBeFalsy();
    });
  });

  describe('buildActionList function', () => {
    beforeEach(initComponent('users', '12345'));
    afterEach(function () {
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    });

    it('should insert the Add Buttons in the actionList', function () {
      this.controller.editing = false;
      this.controller.buildActionList();
      expect(this.controller.actionList[0].actionKey).toEqual('phoneButtonLayout.addButton');
      expect(this.controller.actionList[1].actionKey).toEqual('phoneButtonLayout.reorder');
    });

    it('should remove Add Buttons from the actionList if button limit reached', function () {
      this.controller.editing = false;
      this.controller.buildActionList();
      expect(this.controller.actionList[0].actionKey).toEqual('phoneButtonLayout.addButton');
      expect(this.controller.actionList[1].actionKey).toEqual('phoneButtonLayout.reorder');
      this.controller.isButtonLimitReached = true;
      this.controller.buildActionList();
      expect(this.controller.actionList.length).toEqual(1);
      expect(this.controller.actionList[0].actionKey).toEqual('phoneButtonLayout.reorder');
    });

    it('should make actionList empty if in edit mode', function () {
      this.controller.editing = true;
      this.controller.buildActionList();
      expect(this.controller.actionList.length).toEqual(0);
    });

    it('should make actionList empty if in reorder mode', function () {
      this.controller.draggableInstance = { reordering: true };
      this.controller.buildActionList();
      expect(this.controller.actionList.length).toEqual(0);
    });
  });

  describe('save function', () => {
    beforeEach(initComponent('users', '12345'));
    afterEach(function () {
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    });

    it('should empty out destination and label values for FEATURE_NONE button types', function () {
      this.controller.phoneButtonListFull = [{
        type: 'FEATURE_NONE',
        destination: 'bogus_destination_for_empty_button',
        label: 'bogus_label_for_empty_button',
      }];
      this.controller.save();
      expect(this.controller.phoneButtonListFull[0].destination).toEqual('');
      expect(this.controller.phoneButtonListFull[0].label).toEqual('');
      expect(this.PhoneButtonLayoutService.updatePhoneButtons).toHaveBeenCalledTimes(1);
    });
  });

  describe('setDefaultPhoneButtonAttributes function', () => {
    beforeEach(initComponent('users', '12345'));
    afterEach(function () {
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    });

    it('should set attributes for empty buttons to the expected values', function () {
      const emptyButtons: IPhoneButton[] = [{
        type: 'FEATURE_NONE',
        index: 10,
        destination: 'bogus_destination_for_empty_button',
        label: 'bogus_label_for_empty_button',
        callPickupEnabled: true,
        appliesToSharedLines: true,
      }];
      this.controller.setDefaultPhoneButtonAttributes(emptyButtons);
      const button: IPhoneButton = emptyButtons[0];
      expect(button.type).toEqual('FEATURE_NONE');
      expect(button.appliesToSharedLines).toBeFalsy();
      expect(button.callPickupEnabled).toBeFalsy();
      expect(button.destination).toEqual('');
      expect(button.isDeletable).toBeTruthy();
      expect(button.isEditable).toBeFalsy();
    });

    it('should set attributes for speed dial buttons to the expected values', function () {
      const speedDialButtons: IPhoneButton[] = [{
        type: 'FEATURE_SPEED_DIAL_BLF',
        index: 100,
        destination: '5000',
        label: 'Speedy Speedster',
        callPickupEnabled: true,
        appliesToSharedLines: false,
      }, {
        type: 'FEATURE_SPEED_DIAL',
        index: 2000,
        destination: '5001',
        label: 'Wrong Speed Dial Type',
        callPickupEnabled: true,
        appliesToSharedLines: false,
      }];
      this.controller.setDefaultPhoneButtonAttributes(speedDialButtons);
      const blfSpeedDialButton: IPhoneButton = speedDialButtons[0];
      expect(blfSpeedDialButton.type).toEqual('FEATURE_SPEED_DIAL_BLF');
      expect(blfSpeedDialButton.destination).not.toEqual('');
      expect(blfSpeedDialButton.isDeletable).toBeTruthy();
      expect(blfSpeedDialButton.isEditable).toBeTruthy();
      const nonBlfSpeedDialButton: IPhoneButton = speedDialButtons[1];
      expect(nonBlfSpeedDialButton.type).toEqual('FEATURE_SPEED_DIAL_BLF');
      expect(nonBlfSpeedDialButton.destination).not.toEqual('');
      expect(nonBlfSpeedDialButton.isDeletable).toBeTruthy();
      expect(nonBlfSpeedDialButton.isEditable).toBeTruthy();
    });

    it('should set attributes for call park buttons to the expected values', function () {
      const callParkButtons: IPhoneButton[] = [{
        type: 'FEATURE_BLF_DIRECTED_PARK',
        index: 1000,
        destination: '123',
        label: 'BLF Call Park',
        callPickupEnabled: false,
        appliesToSharedLines: false,
      }, {
        type: 'FEATURE_CALL_PARK',
        index: 1000,
        destination: '123',
        label: 'Non-BLF Call Park',
        callPickupEnabled: false,
        appliesToSharedLines: false,
      }];
      this.controller.setDefaultPhoneButtonAttributes(callParkButtons);
      const blfCallParkButton: IPhoneButton = callParkButtons[0];
      expect(blfCallParkButton.type).toEqual('FEATURE_BLF_DIRECTED_PARK');
      expect(blfCallParkButton.isDeletable).toBeFalsy();
      expect(blfCallParkButton.isEditable).toBeFalsy();
      const nonBlfCallParkButton: IPhoneButton = callParkButtons[1];
      expect(nonBlfCallParkButton.type).toEqual('FEATURE_BLF_DIRECTED_PARK');
      expect(nonBlfCallParkButton.isDeletable).toBeFalsy();
      expect(nonBlfCallParkButton.isEditable).toBeFalsy();
    });

    it('should set attributes for non-empty and non-speed dial buttons to the expected values', function () {
      const otherButtons: IPhoneButton[] = [{
        type: 'FEATURE_LINE',
        index: 1,
        destination: '100',
        label: 'Primary Line',
        callPickupEnabled: false,
        appliesToSharedLines: false,
      }];
      this.controller.setDefaultPhoneButtonAttributes(otherButtons);
      const lineButton: IPhoneButton = otherButtons[0];
      expect(lineButton.isDeletable).toBeFalsy();
      expect(lineButton.isEditable).toBeFalsy();
    });
  });

  describe('updateIndex function', () => {
    beforeEach(initComponent('users', '12345'));
    afterEach(function () {
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    });

    it('should re-index button indices sequentially', function () {
      this.controller.phoneButtonListFull = [{ index: 0 }, { index: 0 }, { index: 0 }, { index: 0 }];
      this.controller.updateIndex();
      const buttonList = this.controller.phoneButtonListFull;
      expect(buttonList[0].index).toEqual(1);
      expect(buttonList[1].index).toEqual(2);
      expect(buttonList[2].index).toEqual(3);
      expect(buttonList[3].index).toEqual(4);
    });
  });

  describe(' - keyboard navigation functionality', function () {
    beforeEach(initComponent('users', '12345'));
    beforeEach(function () {
      this.list = [{
        id: 'phoneButton1',
        index: 1,
      }, {
        id: 'phoneButton2',
        index: 2,
      }, {
        id: 'phoneButton3',
        index: 3,
      }];

      this.controller.phoneButtonList = this.list;
    });

    it('should call DraggableService functions createDraggableInstance and keyPress', function () {
      spyOn(this.DraggableService, 'createDraggableInstance').and.callThrough();
      this.controller.setReorder();
      expect(this.DraggableService.createDraggableInstance).toHaveBeenCalledWith({
        elem: this.controller.$element,
        scope: jasmine.any(Object),
        list: this.list,
        identifier: '#arrangeablePhoneButtonsContainer',
        transitClass: 'phonebuttonlayout-reorder',
        itemIdentifier: '#phoneButton',
      });
    });

    it('should return true or false for isSelectedPhoneButton', function () {
      this.controller.setReorder();
      spyOn(this.controller.draggableInstance, 'keyPress').and.callThrough();

      this.controller.phoneButtonKeyPress({ which: KeyCodes.ENTER }, this.list[1]);
      expect(this.controller.isSelectedPhoneButton(this.list[1])).toBeTruthy();
      expect(this.controller.isSelectedPhoneButton(this.list[0])).toBeFalsy();
      expect(this.controller.draggableInstance.keyPress).toHaveBeenCalledWith({ which: KeyCodes.ENTER }, this.list[1]);
    });
  });
});
