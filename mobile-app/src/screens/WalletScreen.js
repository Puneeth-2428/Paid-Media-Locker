import React, { useState, useCallback, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { TouchableOpacity } from 'react-native';

export default function WalletScreen() {
  const [wallet, setWallet] = useState({ balance: 0, history: [] });
  const [loading, setLoading] = useState(true);
  const { user, logout } = useContext(AuthContext);

  const fetchWallet = async () => {
    try {
      const { data } = await client.get('/wallet');
      setWallet(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWallet();
    }, [])
  );

  const renderItem = ({ item }) => {
    const isSeller = item.seller === user._id;
    return (
      <View style={styles.historyCard}>
        <Text style={styles.historyType}>{isSeller ? 'Media Sold' : 'Bought Media'}</Text>
        <Text style={[styles.historyAmount, isSeller && styles.historyAmountEarned]}>
          {isSeller ? '+' : '-'}{item.amount} coins
        </Text>
      </View>
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#e91e63" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceTitle}>Current Balance</Text>
        <Text style={styles.balanceAmount}>{wallet.balance}</Text>
        <Text style={styles.coinText}>Coins</Text>
      </View>
      
      <Text style={styles.historyTitle}>Transaction History</Text>
      <FlatList
        data={wallet.history}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No transactions yet.</Text>}
      />

      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={logout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  balanceCard: { backgroundColor: '#1e1e1e', padding: 30, borderRadius: 20, alignItems: 'center', marginBottom: 30, marginTop: 40, elevation: 5 },
  balanceTitle: { color: '#ccc', fontSize: 18, marginBottom: 10 },
  balanceAmount: { color: '#e91e63', fontSize: 48, fontWeight: '900' },
  coinText: { color: '#fff', fontSize: 16, marginTop: 5 },
  historyTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  historyCard: { backgroundColor: '#1e1e1e', padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  historyType: { color: '#fff', fontSize: 16 },
  historyAmount: { color: '#ff5252', fontSize: 16, fontWeight: 'bold' },
  historyAmountEarned: { color: '#4caf50' },
  emptyText: { color: '#777', textAlign: 'center', marginTop: 20 },
  logoutButton: { backgroundColor: '#e91e63', padding: 15, borderRadius: 10, marginTop: 20, alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
