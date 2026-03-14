// client\src\types\entities\track.types.ts

export type Track = {
  disc_number: number
  position: string
  title: string
  size?: string
  speed?: string
}

export interface createTrack {
  position: string;
  title: string;
  duration: string;
}