import { View, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function Home() {
  const { colors } = useTheme();
  
  return (
    <View style={{ 
      flex:1, 
      justifyContent:'center', 
      alignItems:'center', 
      backgroundColor: colors.background 
    }}>
      <Text style={{ fontSize:32, fontWeight:'700', color: colors.text }}>BrainDump </Text>
      <Text style={{ color: colors.textSecondary, marginTop:8 }}>Home page coming soon</Text>
    </View>
  );
}