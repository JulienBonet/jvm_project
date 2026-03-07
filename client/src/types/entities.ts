// ---------- //
//  GENERIC
// ---------- //

export interface BaseEntity {
  id: number;
  name: string;
  sorted_name: string;
  image_url: string;
  discogs_id?: number;
  release_count?: number;
  discogs_image_url?: string;
}

export interface BaseEntityForm {
  name: string;
  sorted_name: string;
  discogs_id?: number;
  image_url?: string;
}

export interface EntityEditor<T> {
  entity: T | null
  setEntity: React.Dispatch<React.SetStateAction<T | null>>

  editMode: boolean
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>

  onStartEdit: () => void
  onCancelEdit: () => void
  onSave: () => void

  uploading?: boolean
  fetching?: boolean
}

// ---------- //
//  ARTIST
// ---------- //

export interface Artist extends BaseEntity {
  id: number;
  name: string;
  sorted_name: string;
  image_url: string;
  release_count: number;
  discogs_id?: number;
  discogs_image_url?: string;
}

export interface ArtistForm extends BaseEntityForm {
  name: string;
  sorted_name: string;
  image_url?: string;
  discogs_id?: number;
}

// ---------- //
//  LABEL
// ---------- //

export interface Label extends BaseEntity {
  id: number;
  name: string;
  sorted_name: string;
  image_url: string;
  release_count: number;
  discogs_id?: number;
  discogs_image_url?: string;
}

export interface LabelForm extends BaseEntityForm {
  name: string;
  sorted_name: string;
  image_url?: string;
  discogs_id?: number;
}

// ---------- //
//  RELEASE
// ---------- //

export interface Release {
  id: number
  title: string
  year: number
  disc_size: string
  genres?: string
  styles?: string
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
  links?: { platform: string; url: string }[];
}

export type Track = {
  disc_number: number
  position: string
  title: string
  size?: string
  speed?: string
}

export interface ReleaseLink {
  platform: string
  url: string
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