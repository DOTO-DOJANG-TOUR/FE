import { StyleSheet, Text, View } from 'react-native';

export default function FestivalHomeScreen() {
  return (
    <View style={styles.container}>
      <Text>축제 홈</Text>
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
