'use strict';

var SpacesPage = function () {
  this.roomsList = element(by.id('roomsListPanel'));
  this.estimatedSize = element(by.id('estimatedSize'));
  this.moreOptions = element(by.id('userMoreOptions'));

  this.addButton = element(by.id('addRooms'));
  this.addRoomDialog = element(by.id('addRoomDialog'));
  this.newRoomField = element(by.id('newRoom'));
  this.addRoomButton = element(by.id('btnAdd'));
  this.btnCancel = element(by.id('btn-cancel'));
  this.deviceCard = element(by.id('deviceAddCard'));
  this.deviceCardClose = element(by.id('closeDeviceCard'));
  this.deviceModalClose = element(by.id('device-modal-close'));
  this.confirmDeviceName = element(by.id('confirmDeviceName'));
  this.doneDevicesAdd = element(by.id('doneDevicesButton'));
  this.actionLink = element.all(by.css('#actionlink i')).first();
  this.deleteDeviceAction = element.all(by.css('#deleteDeviceAction a')).first();
  this.deleteDeviceModal = element(by.id('deleteDeviceModal'));
  this.deleteButton = element(by.id('deleteButton'));
  this.cancelButton = element(by.id('cancelButton'));
};

module.exports = SpacesPage;
