export type PathSegment = string | number

export interface EditorActions {
  toggle: (path: PathSegment[]) => void
  setVal: (path: PathSegment[], value: unknown) => void
  addItem: (path: PathSegment[], item: unknown) => void
  removeItem: (path: PathSegment[], index: number) => void
}
