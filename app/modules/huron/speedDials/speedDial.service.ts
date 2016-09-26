export interface ISpeedDial {
  edit?: boolean;
  label: string;
  number: string;
  index: number;
}

export class SpeedDialService {
  /* @ngInject */
  constructor(private $q: ng.IQService) { }

  public getSpeedDials(_type: string, _id: string): ng.IPromise<{speedDials: ISpeedDial[]}> {
    return this.$q.resolve({
      speedDials: [],
    });
  }

  public updateSpeedDials(_type: string, _id: string, _list: ISpeedDial[]): ng.IPromise<boolean> {
    return this.$q.resolve(true);
  }
}
