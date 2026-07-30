import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { auth } from '../firebase';
import { signInWithPhoneNumber } from 'firebase/auth';

export default function AuthScreen({ navigation }: any) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirm, setConfirm] = useState<any>(null);
  const [code, setCode] = useState('');

  const signIn = async () => {
    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber);
      setConfirm(confirmation);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const confirmCode = async () => {
    try {
      await confirm.confirm(code);
      // navigation.replace('Home'); -> Handled by root navigator state
    } catch (error: any) {
      Alert.alert('Invalid code', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nairobi Retail Data Capture</Text>
      {!confirm ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Phone Number (e.g. +2547...)"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          <Button title="Send OTP" onPress={signIn} />
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Verification Code"
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
          />
          <Button title="Confirm Code" onPress={confirmCode} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderBottomWidth: 1, marginBottom: 20, fontSize: 18, padding: 5 }
});
