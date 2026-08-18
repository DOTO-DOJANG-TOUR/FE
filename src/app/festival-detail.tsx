import { StyleSheet, Text, View } from 'react-native';

export default function FestivalDetailScreen() {
  return (
    <View style={styles.container}>
      <Text>축제 상세</Text>
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
