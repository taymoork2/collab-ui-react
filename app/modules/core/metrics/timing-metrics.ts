import {
  MarkKey,
  MeasureKey,
  TimingKey,
} from './metrics.keys';

export enum PerformanceType {
  MARK = 'mark',
  MEASURE = 'measure',
}

type MarkOrPerformanceTimingKey = MarkKey | keyof PerformanceTiming;

interface ITimingMetric {
  key: TimingKey;
  measure: MeasureKey;
  markStart: MarkOrPerformanceTimingKey;
  markStop: MarkOrPerformanceTimingKey;
  isOneTime?: boolean;
}

export class TimingMetric implements ITimingMetric {
  public key: TimingKey;
  public measure: MeasureKey;
  public markStart: MarkOrPerformanceTimingKey;
  public markStop: MarkOrPerformanceTimingKey;
  public isOneTime: boolean;

  constructor({
    key,
    measure,
    markStart,
    markStop,
    isOneTime = false,
  }: ITimingMetric) {
    this.key = key;
    this.measure = measure;
    this.markStart = markStart;
    this.markStop = markStop;
    this.isOneTime = isOneTime;
  }
}

export const timingMetrics = [
  new TimingMetric({
    key: TimingKey.LOGIN_DURATION,
    measure: MeasureKey.LOGIN_DURATION,
    markStart: MarkKey.LOGIN_START,
    markStop: MarkKey.LOGIN_STOP,
    isOneTime: true,
  }),
];
