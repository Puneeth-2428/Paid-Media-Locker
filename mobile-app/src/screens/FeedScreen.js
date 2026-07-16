import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import client from '../api/client';

export default function FeedScreen() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const { user, setUser } = useContext(AuthContext);

  const fetchFeed = async () => {
    try {
      const { data } = await client.get('/media');
      setFeed(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFeed();
    }, [])
  );

  const handleUnlock = async (mediaId, price) => {
    try {
      const { data } = await client.post(`/media/${mediaId}/unlock`);
      Alert.alert('Success', 'Media unlocked!');
      // Update local wallet balance
      setUser(prev => ({ ...prev, walletBalance: data.balance }));
      fetchFeed(); // Refresh feed to update status
    } catch (e) {
      Alert.alert('Unlock Failed', e.response?.data?.error || e.message);
    }
  };

  const handleViewOriginal = async (mediaId) => {
    try {
      const { data } = await client.get(`/media/${mediaId}/access`);
      setOriginalImageUrl(data.originalUrl);
    } catch (e) {
      Alert.alert('Access Failed', e.response?.data?.error || e.message);
    }
  };

  const renderItem = ({ item }) => {
    const isUnlocked = item.status === 'unlocked';
    
    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.previewUrl }} style={styles.image} />
          {!isUnlocked && (
            <View style={styles.lockedOverlay}>
              <Text style={styles.lockedText}>LOCKED</Text>
            </View>
          )}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.ownerText}>By {item.owner} • {item.price} Coins</Text>
          {isUnlocked ? (
            <TouchableOpacity style={styles.viewButton} onPress={() => handleViewOriginal(item._id)}>
              <Text style={styles.buttonText}>View Original</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.unlockButton} onPress={() => handleUnlock(item._id, item.price)}>
              <Text style={styles.buttonText}>Unlock for {item.price} coins</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#e91e63" /></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Discover Media</Text>
      <FlatList
        data={feed}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      
      <Modal visible={!!originalImageUrl} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setOriginalImageUrl(null)}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
          {originalImageUrl && (
            <Image source={{ uri: originalImageUrl }} style={styles.fullImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 15, marginTop: 40, marginLeft: 10 },
  card: { backgroundColor: '#1e1e1e', borderRadius: 15, overflow: 'hidden', marginBottom: 20, elevation: 5 },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 250, resizeMode: 'cover' },
  lockedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  lockedText: { color: 'rgba(255,255,255,0.8)', fontSize: 32, fontWeight: '900', letterSpacing: 2 },
  cardInfo: { padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ownerText: { color: '#ccc', fontSize: 16 },
  unlockButton: { backgroundColor: '#e91e63', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  viewButton: { backgroundColor: '#4caf50', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  modalContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 1, backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 20 },
  closeText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  fullImage: { width: '100%', height: '100%' }
});
