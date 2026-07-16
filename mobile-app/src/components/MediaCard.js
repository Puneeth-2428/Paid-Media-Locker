import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function MediaCard({ item, onPress }) {
  const isUnlocked = item.status === 'unlocked';

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: isUnlocked && item.originalUrl ? item.originalUrl : item.previewUrl }} style={styles.image} />
        {!isUnlocked && (
          <View style={styles.lockedOverlay}>
            <Text style={styles.lockedText}>LOCKED</Text>
          </View>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.ownerText}>By {item.owner}</Text>
        {isUnlocked ? (
          <View style={styles.badgeSuccess}>
            <Text style={styles.badgeText}>UNLOCKED</Text>
          </View>
        ) : (
          <View style={styles.badgeLocked}>
            <Text style={styles.badgeText}>{item.price} Coins</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
    backgroundColor: '#333',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
    opacity: 0.8,
  },
  infoContainer: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ownerText: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: '500',
  },
  badgeSuccess: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  badgeLocked: {
    backgroundColor: '#e91e63',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
