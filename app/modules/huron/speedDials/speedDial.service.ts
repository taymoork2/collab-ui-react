export interface ISpeedDial {
  edit?: boolean;
  label: string;
  number: string;
  index: number;
}

export class SpeedDialService {
  constructor(private $q: ng.IQService) { }

  public getSpeedDials(type: string, id: string): ng.IPromise<{speedDials: ISpeedDial[]}> {
    return this.$q.when({
      speedDials: [],
    });
  }

  public updateSpeedDials(type: string, id: string, list: ISpeedDial[]): ng.IPromise<boolean> {
    return this.$q.when(true);
  }
}
