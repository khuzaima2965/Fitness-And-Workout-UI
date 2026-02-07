import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../styles/colors';

export default function ExerciseItem({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress && onPress(item)}>
      <View style={styles.thumb} />
      <View style={styles.info}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.meta}>{item.duration} • {item.difficulty}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', padding: 12, alignItems: 'center' },
  thumb: { width: 64, height: 64, borderRadius: 8, backgroundColor: colors.surfaceVariant },
  info: { marginLeft: 12, flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: colors.onSurface },
  meta: { marginTop: 4, color: colors.onSurfaceVariant },
});
