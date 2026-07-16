import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { unlockMedia, getAccessUrl } from '../api/media';
import CustomButton from '../components/CustomButton';

export default function MediaDetailsScreen({ route, navigation }) {
  const { item } = route.params;
  const [isUnlocked, setIsUnlocked] = useState(item.status === 'unlocked');
  const [originalUrl, setOriginalUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isUnlocked) {
      fetchOriginalImage();
    }
  }, [isUnlocked]);

  const fetchOriginalImage = async () => {
    try {
      const data = await getAccessUrl(item._id);
      setOriginalUrl(data.originalUrl);
    } catch (error) {
      Alert.alert('Access Error', error.response?.data?.error || error.message);
    }
  };

  const handleUnlock = () => {
    Alert.alert(
      'Confirm Purchase',
      `Unlock this media for ${item.price} coins?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Unlock', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await unlockMedia(item._id);
              Alert.alert('Success', 'Media unlocked successfully!');
              setIsUnlocked(true);
            } catch (error) {
              Alert.alert('Unlock Failed', error.response?.data?.error || error.message);
            } finally {
              setLoading(false);
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {isUnlocked && originalUrl ? (
          <Image source={{ uri: originalUrl }} style={styles.image} resizeMode="contain" />
        ) : (
          <>
            <Image source={{ uri: item.previewUrl }} style={styles.image} />
            <View style={styles.lockedOverlay}>
              <Text style={styles.lockedText}>LOCKED</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.ownerText}>By {item.owner}</Text>
        <Text style={styles.priceText}>{item.price} Coins</Text>

        {!isUnlocked && (
          <CustomButton 
            title={`Unlock for ${item.price} Coins`} 
            onPress={handleUnlock} 
            loading={loading}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  imageContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#000',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  detailsContainer: {
    padding: 20,
  },
  ownerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  priceText: {
    color: '#4caf50',
    fontSize: 18,
    marginBottom: 20,
  },
});
