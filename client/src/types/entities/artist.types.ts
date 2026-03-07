import { BaseEntity, BaseEntityForm } from "../shared/base.types"

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