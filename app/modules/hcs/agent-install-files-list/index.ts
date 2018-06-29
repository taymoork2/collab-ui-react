import './install-files.scss';
import { InstallFilesComponent } from './agent-install-files-list.component';
import modalServiceModule from 'modules/core/modal';

export default angular
  .module('hcs.installFiles', [
    modalServiceModule,
    require('angular-translate'),
    require('modules/hcs/hcs-shared').default,
  ])
  .component('hcsInstallFiles', new InstallFilesComponent())
  .name;
