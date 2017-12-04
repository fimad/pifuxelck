export interface Drawing {
  background_color: Color;
  lines: Line[];
}

export interface Color {
  alpha: number;
  red: number;
  green: number;
  blue: number;
}

export interface Line {
  color: Color;
  size: number;
  points: Point[];
}

export interface Point {
  x: number;
  y: number;
}
