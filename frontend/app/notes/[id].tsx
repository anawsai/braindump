import { View, Text, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
// import { fetchNoteById, updateNote, deleteNote } from '../../lib/api'; // TODO: implement then uncomment
// import { useEffect, useState } from 'react';

export default function NoteDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // TODO:
  // 1) load one note by ID:
  //    useEffect(() => {
  //      fetchNoteById(id!).then(setState).catch(console.error);
  //    }, [id]);
  //
  // 2) show title + content fields (TextInputs)
  // 3) save changes via updateNote(id!, { title, content })
  // 4) add delete button that calls deleteNote(id!) then router.replace('/notes')

  return (
    <View style={{ flex:1, padding:16, gap:8, justifyContent:'center', alignItems:'center' }}>
      <Text style={{ fontSize:20, fontWeight:'700' }}>Note Detail</Text>
      <Text>ID: {id}</Text>
      <Text style={{ color:'#666', marginTop:6 }}>TODO: load + edit this note here.</Text>

      <View style={{ height:12 }} />
      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
}
