import { db } from "./firebase";
import { collection, doc, setDoc, getDocs, deleteDoc, getDoc } from "firebase/firestore";

export interface Playlist {
  id: string;
  name: string;
  songs: any[];
}

export const createPlaylist = async (userId: string, name: string) => {
  const playlistRef = doc(collection(db, `users/${userId}/playlists`));
  const newPlaylist: Playlist = { id: playlistRef.id, name, songs: [] };
  await setDoc(playlistRef, newPlaylist);
  return newPlaylist;
};

export const deletePlaylist = async (userId: string, playlistId: string) => {
  const playlistRef = doc(db, `users/${userId}/playlists`, playlistId);
  await deleteDoc(playlistRef);
};

export const renamePlaylist = async (userId: string, playlistId: string, newName: string) => {
  const playlistRef = doc(db, `users/${userId}/playlists`, playlistId);
  const docSnap = await getDoc(playlistRef);
  if (docSnap.exists()) {
    await setDoc(playlistRef, { ...docSnap.data(), name: newName });
  }
};

export const getPlaylistById = async (userId: string, playlistId: string): Promise<Playlist | null> => {
  const playlistRef = doc(db, `users/${userId}/playlists`, playlistId);
  const docSnap = await getDoc(playlistRef);
  if (docSnap.exists()) {
    return docSnap.data() as Playlist;
  }
  return null;
};

export const addSongToPlaylist = async (userId: string, playlistId: string, song: any) => {
  const playlistRef = doc(db, `users/${userId}/playlists`, playlistId);
  const playlist = await getPlaylistById(userId, playlistId);
  if (playlist) {
    const updatedSongs = [...playlist.songs, song];
    await setDoc(playlistRef, { ...playlist, songs: updatedSongs });
  }
};

export const getUserPlaylists = async (userId: string): Promise<Playlist[]> => {
  const querySnapshot = await getDocs(collection(db, `users/${userId}/playlists`));
  const playlists: Playlist[] = [];
  querySnapshot.forEach((doc) => {
    playlists.push(doc.data() as Playlist);
  });
  return playlists;
};

export const addSongToFavorites = async (userId: string, song: any) => {
  const favRef = doc(db, `users/${userId}/favorites`, song.id);
  await setDoc(favRef, song);
};

export const removeSongFromFavorites = async (userId: string, songId: string) => {
  const favRef = doc(db, `users/${userId}/favorites`, songId);
  await deleteDoc(favRef);
};

export const getUserFavorites = async (userId: string) => {
  const querySnapshot = await getDocs(collection(db, `users/${userId}/favorites`));
  const favorites: any[] = [];
  querySnapshot.forEach((doc) => {
    favorites.push(doc.data());
  });
  return favorites;
};
