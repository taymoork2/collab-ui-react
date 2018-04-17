import './install-files.scss';
import { InstallFilesComponent } from './agent-install-files-list.component';
import modalServiceModule from 'modules/core/modal';

export default angular
  .module('hcs.installFiles', [
    modalServiceModule,
  ])
.component('hcsInstallFiles', new InstallFilesComponent())
.name;
