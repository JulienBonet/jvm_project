export interface FormatStat {
  format_group: "big" | "7";
  total: number;
}

export interface TopItem {
  name: string;
  total: number;
}

export interface Stats {
  releases: number;
  artists: number;
  labels: number;
  formats: FormatStat[];
  topGenres: TopItem[];
  topLabels: TopItem[];
  topArtists: TopItem[];
}