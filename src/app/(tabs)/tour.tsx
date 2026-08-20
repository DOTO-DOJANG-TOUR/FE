import { StyleSheet, Text, View } from 'react-native';

export default function TourScreen() {
  return (
    <View style={styles.container}>
      <Text>투어</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
