import React, { useState, useCallback, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getFeed } from '../api/media';
import { getWallet } from '../api/wallet';
import MediaCard from '../components/MediaCard';
import { AuthContext } from '../context/AuthContext';

export default function MediaFeedScreen({ navigation }) {
  const { signOut } = useContext(AuthContext);
  const [feed, setFeed] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [feedData, walletData] = await Promise.all([
        getFeed(),
        getWallet(),
      ]);
      setFeed(feedData);
      setBalance(walletData.balance);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handlePressCard = (item) => {
    navigation.navigate('Details', { item });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e91e63" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.walletTitle}>Wallet Balance</Text>
          <Text style={styles.walletAmount}>{balance} Coins</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={feed}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <MediaCard item={item} onPress={handlePressCard} />
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshing={loading}
        onRefresh={fetchData}
        ListEmptyComponent={<Text style={styles.empty}>No media found.</Text>}
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('Upload')}
      >
        <Text style={styles.fabText}>+ Publish</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    marginTop: 10,
  },
  walletTitle: {
    color: '#888',
    fontSize: 14,
  },
  walletAmount: {
    color: '#4caf50',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: '#ff5252',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  empty: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#e91e63',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
