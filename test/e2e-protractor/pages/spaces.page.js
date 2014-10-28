'use strict'

var SpacesPage = function() {
  this.roomsList = element(by.id('roomsListPanel'));
  this.estimatedSize = element(by.id('estimatedSize'));
  this.moreOptions = element(by.id('userMoreOptions'));

  this.addButton = element(by.id('addRooms'));
  this.addRoomDialog = element(by.id('addRoomDialog'));
  this.newRoomField = element(by.id('newRoom'));
  this.addRoomButton = element(by.id('btnAdd'));
  this.btnCancel = element(by.id('btn-cancel'));
}

module.exports = SpacesPage;
