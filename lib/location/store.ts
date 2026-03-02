import { create } from "zustand";

export interface Location {
    latitude: number;
    longitude: number;
}

interface LocationState {
    location: Location | undefined;
    setLocation: (location: Location | undefined) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
    location: undefined,
    setLocation: (location) => set({ location }),
}))