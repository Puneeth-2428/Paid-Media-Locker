import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import client from '../api/client';

export default function UploadScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [price, setPrice] = useState('');
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      return Alert.alert('Error', 'Please select an image first');
    }
    if (!price || isNaN(price) || Number(price) < 0) {
      return Alert.alert('Error', 'Please enter a valid price');
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('price', price);
      
      const filename = image.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('image', { uri: image.uri, name: filename, type });

      await client.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Image uploaded successfully!');
      setImage(null);
      setPrice('');
      navigation.navigate('Feed');
    } catch (e) {
      Alert.alert('Upload Failed', e.response?.data?.error || e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Monetize New Media</Text>
      
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.previewImage} />
        ) : (
          <Text style={styles.pickerText}>Tap to select an image</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Set Unlock Price (Coins)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        placeholderTextColor="#aaa"
      />

      <TouchableOpacity style={styles.uploadButton} onPress={handleUpload} disabled={uploading}>
        {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Publish & Set Price</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20, marginTop: 40 },
  imagePicker: { height: 250, backgroundColor: '#1e1e1e', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden', borderWidth: 2, borderColor: '#333', borderStyle: 'dashed' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  pickerText: { color: '#888', fontSize: 16 },
  input: { backgroundColor: '#333', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 20, fontSize: 16 },
  uploadButton: { backgroundColor: '#4caf50', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
