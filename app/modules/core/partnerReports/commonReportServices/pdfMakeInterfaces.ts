export interface IPDFMakeContent extends IPDFMakeBase {
  bold?: boolean;
  text?: string;
  canvas?: Array<ICanvas>;
  colSpan?: number;
  columns?: Array<IPDFMakeContent>;
  columnGap?: number;
  fit?: Array<number>;
  image?: any;
  pageBreak?: string;
  stack?: Array<IPDFMakeContent>;
  table?: IPDFMakeTable;
  width?: number | string;
}

export interface IPDFMakeLayout {
  content: Array<IPDFMakeContent>;
  footer?: Function | string;
  header?: Function | string;
  styles?: any;
}

// private interfaces
interface ICanvas {
  type: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  lineWidth: number;
}

interface IPDFMakeTable extends IPDFMakeBase {
  widths: Array<number | string>;
  headerRows: number;
  body: Array<IPDFMakeContent>;
}

interface IPDFMakeBase {
  alignment?: string;
  fillColor?: string;
  style?: string | Array<string>;
}
