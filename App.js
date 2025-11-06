import { StyleSheet, Text, View, StatusBar } from 'react-native';
import { Main } from './components/Main';
import { SafeAreaProvider } from "react-native-safe-area-context";
import DoctorScreen from './components/DoctorScreen';
export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
      <StatusBar style="auto" />
      <DoctorScreen/>
    </View>

    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '50vh',
    flex: 1,
    backgroundColor: '#fff',
  },
});
