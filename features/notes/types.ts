// NoteItem type for dialog UI
export interface NoteItem {
  id?: string;
  timeslice_id?: string | null;
  message?: string; // Added message property
  isNew?: boolean;
  isPinned?: boolean;
  isSaving?: boolean;
  hasError?: boolean;
  // Add other properties as needed
}
export interface CreateNoteItem {
  id?: string | null;
  timeslice_id?: string | null;
  user_id?: string | null;
  message: string;
  isNew: boolean;
  isSaving?: boolean;
  hasError?: boolean;
  isPinned?: boolean;
}

export interface NoteDialogState {
  notes: NoteItem[];
  deletedNoteIds: string[];
  energy: number;
  activeNoteIndex: number | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseNoteHandlersProps {
  notes: NoteItem[];
  setNotes: React.Dispatch<React.SetStateAction<NoteItem[]>>;
  energy: number;
  mood: number;
  timeslice: {
    id?: string;
    activity_id?: string;
    note_ids?: string[] | null;
    state_id?: string | null;
  };
  noteIds: string[];
  activeNoteIndex: number | null;
  setActiveNoteIndex: React.Dispatch<React.SetStateAction<number | null>>;
}

export interface NoteDialogProps {
  timeslice: {
    id?: string;
    activity_id?: string;
    note_ids?: string[] | null;
    state_id?: string | null;
  };
  _dialogId?: string;
}

export interface NoteOperations {
  addNote: () => void;
  updateNote: (index: number, message: string) => void;
  deleteNote: (index: number) => Promise<void>;
  saveNote: (index: number) => Promise<void>;
  saveAllNotes: () => Promise<void>;
  setActiveNote: (index: number | null) => void;
  pinNote: (index: number) => void;
  unpinNote: (index: number) => void;
}

export interface EnergyBarProps {
  level: number;
  isActive: boolean;
  onPress: () => void;
}
