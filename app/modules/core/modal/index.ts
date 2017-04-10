
let ModalService = require('./modal.service');
let ModalCtrl = require('./modal.controller');

/**
 * Add a type to the default Modal settings (used by $modal)
 */
interface IToolkitModalSettings extends ng.ui.bootstrap.IModalSettings {
  hideDismiss?: boolean;
  hideTitle?: boolean;
  title?: string;
  message?: string;
  close?: string;
  dismiss?: string;
  type?: string;
}

/**
 * Modal that uses the IModalSettings settings (used by $modal)
 */
interface IToolkitModalService extends ng.ui.bootstrap.IModalService {
  open(options: IToolkitModalSettings): ng.ui.bootstrap.IModalServiceInstance;
}

/**
 * Instance of a Modal from $modal.open
 */
interface IToolkitModalServiceInstance extends ng.ui.bootstrap.IModalServiceInstance {
}

export { IToolkitModalService, IToolkitModalSettings, IToolkitModalServiceInstance };

export default angular
  .module('core.modal', [
    'collab.ui',
    'pascalprecht.translate',
  ])
  .service('ModalService', ModalService)
  .controller('ModalCtrl', ModalCtrl)
  .name;
