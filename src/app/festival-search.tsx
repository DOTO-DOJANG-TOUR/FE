import { StyleSheet, Text, View } from 'react-native';

export default function FestivalSearchScreen() {
  return (
    <View style={styles.container}>
      <Text>축제 검색</Text>
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
