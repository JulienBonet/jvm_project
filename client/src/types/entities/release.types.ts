// client\src\types\entities\release.types.ts
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

// create realease

export interface ReleaseState {
  title: string;
  year: string;
  country: string;
  barcode: string;
  release_type: string;
  notes: string;
  discogs_image_url?: string;
}

export interface DiscState {
  format: string;
  size: string;
  speed: string;
}

export interface Entity {
  name: string;
  discogs_id?: number;
  isNew?: boolean;
}

export interface DiscogsIdentifier {
  type: string;
  value: string;
}

export interface DiscogsArtist {
  name: string;
  id: number;
}

export interface DiscogsLabel {
  name: string;
  id: number;
}

export interface DiscogsFormat {
  name: string;
  descriptions?: string[];
}

export interface DiscogsTrack {
  position: string;
  title: string;
  duration: string;
}

export interface DiscogsVideo {
  uri: string;
}

export interface DiscogsImage {
  uri: string;
}

export interface DiscogsRelease {
  title?: string;
  year?: number;
  country?: string;
  notes?: string;

  identifiers?: DiscogsIdentifier[];
  formats?: DiscogsFormat[];

  artists?: DiscogsArtist[];
  labels?: DiscogsLabel[];

  genres?: string[];
  styles?: string[];

  tracklist?: DiscogsTrack[];

  videos?: DiscogsVideo[];
  images?: DiscogsImage[];

  uri?: string;
}