import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

export type DogStatus = 'safe' | 'lost' | 'found';

export interface Dog {
  id:         string;
  name:       string;
  breed:      string;
  age:        string;
  color:      string;
  chip_id:    string | null;
  chip_type:  'passive' | 'active' | null;
  status:     DogStatus;
  photo_url:  string | null;
  owner_id:   string;
}

export interface Sighting {
  id:         string;
  dog_id:     string;
  source:     'relay' | 'human' | 'collar' | 'nfc';
  lat:        number;
  lng:        number;
  confidence: number;
  created_at: string;
}

interface AppState {
  // Auth
  user:          any | null;
  loading:       boolean;
  // Dogs
  dogs:          Dog[];
  activeDog:     Dog | null;
  // Sightings
  sightings:     Sighting[];
  // UI
  toast:         string;
  // Actions
  init:          () => Promise<void>;
  signIn:        (email: string, pw: string) => Promise<void>;
  signUp:        (email: string, pw: string, meta: any) => Promise<void>;
  signOut:       () => Promise<void>;
  fetchDogs:     () => Promise<void>;
  setActiveDog:  (dog: Dog | null) => void;
  fetchSightings:(dogId: string) => Promise<void>;
  reportLost:    (dogId: string, loc: string) => Promise<void>;
  markFound:     (dogId: string) => Promise<void>;
  showToast:     (msg: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  user:       null,
  loading:    true,
  dogs:       [],
  activeDog:  null,
  sightings:  [],
  toast:      '',

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user ?? null, loading: false });
    if (session?.user) await get().fetchDogs();

    supabase.auth.onAuthStateChange((_ev, session) => {
      set({ user: session?.user ?? null });
      if (session?.user) get().fetchDogs();
    });
  },

  signIn: async (email, pw) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) throw error;
  },

  signUp: async (email, pw, meta) => {
    const { error } = await supabase.auth.signUp({ email, password: pw, options: { data: meta } });
    if (error) throw error;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, dogs: [], activeDog: null });
  },

  fetchDogs: async () => {
    try {
      const dogs = await api.getDogs();
      set({ dogs });
      if (dogs.length > 0 && !get().activeDog) set({ activeDog: dogs[0] });
    } catch (e) {
      console.error('fetchDogs', e);
    }
  },

  setActiveDog: (dog) => set({ activeDog: dog }),

  fetchSightings: async (dogId) => {
    try {
      const sightings = await api.getSightings(dogId);
      set({ sightings });
    } catch (e) {
      console.error('fetchSightings', e);
    }
  },

  reportLost: async (dogId, loc) => {
    await api.reportLost({ dog_id: dogId, last_seen_loc: loc });
    await get().fetchDogs();
    get().showToast('🚨 Alert active — broadcasting now');
  },

  markFound: async (dogId) => {
    await api.closeLost(dogId);
    await get().fetchDogs();
    get().showToast('✓ Marked as found — alert closed');
  },

  showToast: (msg) => {
    set({ toast: msg });
    setTimeout(() => set({ toast: '' }), 3200);
  },
}));
