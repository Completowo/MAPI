import { StyleSheet, Text, View, StatusBar } from 'react-native';
import { Main } from './components/Main';
import { SafeAreaProvider } from "react-native-safe-area-context";
export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
      <StatusBar style="auto" />
      <Main/>
    </View>

    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
