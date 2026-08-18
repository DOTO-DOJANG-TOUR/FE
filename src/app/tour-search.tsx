import { StyleSheet, Text, View } from 'react-native';

export default function TourSearchScreen() {
  return (
    <View style={styles.container}>
      <Text>관광지 검색</Text>
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
