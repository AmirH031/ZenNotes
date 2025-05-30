export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type ThemeMode = 'light' | 'dark';

export type ZenMode = 'off' | 'on';

export type SoundType = 'none' | 'rain' | 'ocean' | 'forest';

export interface AppState {
  notes: Note[];
  activeNoteId: string | null;
  theme: ThemeMode;
  zenMode: ZenMode;
  soundType: SoundType;
  previewVisible: boolean;
  editorHeight: number;
  previewHeight: number;
}