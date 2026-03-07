import {Artist} from './artist.types'
import {Track} from './track.types'

export interface Release {
  id: number;
  title: string;

  artists?: string;
  labels?: string;

  genres?: string;
  styles?: string;

  disc_size?: string;
  disc_speed?: number;

  release_type?: string;
  year?: number;

  image_url?: string;
}

export interface Genre {
  id: number
  name: string
}

export interface Style {
  id: number
  name: string
}

export interface ReleaseLink {
  platform: string
  url: string
}

export interface ReleaseDetail extends Release {
  links?: ReleaseLink[]
}

export interface ReleaseMobile {
  id: number;
  title: string;
  artists?: string;
  labels?: string;
  artist_sorted_name?: string;
  label_sorted_name?: string;
  release_type?: string;
  disc_speed?: number;
  links?: { platform: string; url: string }[];
}

export interface ReleaseMDetail {
  id: number;
  title: string;

  year?: number;
  country?: string;
  barcode?: string;
  notes?: string;
  release_type?: string;

  artists: Artist[];
  labels: { name: string; catalog_number?: string }[];

  genres?: Genre[];
  styles?: Style[];

  cover?: { image_url: string }[];

  tracks?: Track[]

  links?: ReleaseLink[]
}