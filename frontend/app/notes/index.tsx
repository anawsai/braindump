// notes page here
//Add details and stuff in other files in this folder

import { View, Text } from 'react-native';

export default function Notes() {
  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#fafafa' }}>
      <Text style={{ fontSize:32, fontWeight:'700' }}>Notes</Text>
      <Text style={{ color:'#666', marginTop:8 }}>Notes page coming soon</Text>
    </View>
  );
}