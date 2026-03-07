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