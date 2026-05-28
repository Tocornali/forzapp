export interface Car {
  Manufacturer: string
  Model: string
  Year: number
  CarType: string
  CarClass: string
  PI: number
  RaceType?: string
  NeedsRepair?: boolean
  RacesCount?: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  originalRaw?: any
}
