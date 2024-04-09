import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Player {
  id: string;
  name: string;
  isMe: boolean;
  isHost: boolean;
  dataConn?: any;
  mediaConn?: any;
  mediaStream?: any;
  isAudioOn?: boolean;
  isVideoOn?: boolean;
}

interface PlayerState {
  players: Player[];
  otherPlayers: () => Player[];
  getPlayer: (id: string) => Player | undefined;
  addPlayer: (player: Player) => void;
  removePlayer: (id: string) => void;
  toggleMute: (id: string) => void;
  setPlayerMediaConn: (id: string, mediaConn: any) => void;
  setPlayerStream: (id: string, stream: any) => void;
  clearPlayers: () => void;
}

export const usePlayerStore = create<PlayerState>()((set, get) => ({
  players: [],
  getPlayer: (id) => get().players.find((player) => player.id === id),
  otherPlayers: () => get().players.filter((player) => !player.isMe),
  addPlayer: (player) => {
    if (!get().getPlayer(player.id)) {
      set((state) => ({ players: [...state.players, player] }));
    }
  },
  removePlayer: (id) => {
    set((state) => ({
      players: state.players.filter((player) => player.id !== id),
    }));
  },
  toggleMute: (id) => {
    set((state) => ({
      players: state.players.map((player) =>
        player.id === id ? { ...player, isAudioOn: !player.isAudioOn } : player,
      ),
    }));
  },
  setPlayerStream: (id, stream) => {
    set((state) => ({
      players: state.players.map((player) =>
        player.id === id ? { ...player, mediaStream: stream } : player,
      ),
    }));
  },
  setPlayerMediaConn: (id, mediaConn) => {
    set((state) => ({
      players: state.players.map((player) =>
        player.id === id ? { ...player, mediaConn: mediaConn } : player,
      ),
    }));
  },
  clearPlayers: () => set({ players: [] }),
}));

// export const usePersistedPlayerStore = create<PlayerState>()(
//   persist(
//     (set, get) => ({
//       players: [],
//       getPlayer: (id) => get().players.find((player) => player.id === id),
//       addPlayer: (player) =>
//         set((state) => ({ players: [...state.players, player] })),
//       removePlayer: (id) => {
//         set((state) => ({
//           players: state.players.filter((player) => player.id !== id),
//         }));
//       },
//       toggleMute: (id) => {
//         set((state) => ({
//           players: state.players.map((player) =>
//             player.id === id ? { ...player, isMuted: !player.isMuted } : player,
//           ),
//         }));
//       },
//       clearPlayers: () => set({ players: [] }),
//     }),
//     {
//       name: "player-storage", // name of the item in the storage (must be unique)
//       // storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
//     },
//   ),
// );
