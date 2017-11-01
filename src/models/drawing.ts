export type Drawing = {
  background_color: Color
  lines: Line[]
}

export type Color = {
  alpha: number
  red: number
  green: number
  blue: number
}

export type Line = {
  color: Color
  size: number
  points: Point[]
}

export type Point = {
  x: number
  y: number
}
