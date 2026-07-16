import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import CustomButton from '../components/CustomButton';
import { uploadMedia } from '../api/media';

export default function UploadMediaScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handlePublish = async () => {
    if (!image || !price) {
      Alert.alert('Error', 'Please select an image and enter a price.');
      return;
    }

    const priceNum = parseInt(price, 10);
    if (isNaN(priceNum) || priceNum < 0) {
      Alert.alert('Error', 'Please enter a valid price greater than 0.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('price', priceNum.toString());
    formData.append('image', {
      uri: image.uri,
      type: 'image/jpeg', // Assumption for simplify
      name: 'upload.jpg',
    });

    try {
      await uploadMedia(formData);
      Alert.alert('Success', 'Media published successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Upload Failed', error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Upload Paid Media</Text>

      <View style={styles.imagePickerContainer}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}
      </View>

      <CustomButton title="Select Image from Gallery" onPress={pickImage} variant="secondary" />

      <Text style={styles.label}>Set Unlock Price (Coins)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 50"
        placeholderTextColor="#888"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <CustomButton 
        title="Publish Media" 
        onPress={handlePublish} 
        loading={loading}
        style={{ marginTop: 20 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  imagePickerContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
  },
  label: {
    color: '#ccc',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
  },
});
