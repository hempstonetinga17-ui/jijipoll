import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image } from 'react-native';
import { Camera, CameraType } from 'expo-camera/legacy';
import * as Location from 'expo-location';
import { queueEntry, syncQueue } from '../OfflineQueue';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function AddEntryScreen({ navigation }: any) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<any>(null);
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('Kiosk');
  const [note, setNote] = useState('');
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const { status: camStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(camStatus === 'granted' && locStatus === 'granted');
    })();
  }, []);

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photoData = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      setPhoto(photoData.uri);
      
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    }
  };

  const submit = async () => {
    if (!photo || !location || !businessName) return;
    
    const entryData = {
      businessName,
      category,
      note,
      lat: location.latitude,
      lng: location.longitude,
      photoUri: photo // In a real app, upload to R2 and get r2ObjectKey
    };

    try {
      // Simulate network request or push directly if online
      // await queueEntry(entryData);
      await addDoc(collection(db, 'entries'), {
        uid: auth.currentUser?.uid,
        ...entryData,
        r2ObjectKey: `photos/${Date.now()}.jpg`, // Mock
        status: 'pending',
        timestamp: serverTimestamp()
      });
      Alert.alert('Success', 'Entry submitted!');
      navigation.goBack();
    } catch (e) {
      // Offline fallback
      await queueEntry(entryData);
      Alert.alert('Offline', 'Entry queued for sync.');
      navigation.goBack();
    }
  };

  if (hasPermission === null) return <View />;
  if (hasPermission === false) return <Text>No access to camera or location</Text>;

  return (
    <View style={styles.container}>
      {!photo ? (
        <Camera style={styles.camera} type={cameraType} ref={cameraRef}>
          <View style={styles.buttonContainer}>
            <Button title="Take Photo" onPress={takePhoto} />
          </View>
        </Camera>
      ) : (
        <View style={styles.form}>
          <Image source={{ uri: photo }} style={styles.preview} />
          <TextInput placeholder="Business Name" value={businessName} onChangeText={setBusinessName} style={styles.input} />
          <TextInput placeholder="Category (e.g., Kiosk)" value={category} onChangeText={setCategory} style={styles.input} />
          <TextInput placeholder="Optional Note" value={note} onChangeText={setNote} style={styles.input} />
          <Button title="Submit" disabled={!businessName || !photo || !location} onPress={submit} />
          <Button title="Retake" onPress={() => setPhoto(null)} color="red" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1, justifyContent: 'flex-end' },
  buttonContainer: { backgroundColor: 'transparent', flexDirection: 'row', margin: 20, justifyContent: 'center' },
  form: { flex: 1, padding: 20 },
  preview: { height: 200, width: '100%', marginBottom: 20 },
  input: { borderBottomWidth: 1, marginBottom: 20, fontSize: 18, padding: 5 }
});
