import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { auth } from './src/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddEntryScreen from './src/screens/AddEntryScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { syncQueue } from './src/OfflineQueue';
import { AppState } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    
    // Attempt offline sync when app becomes active
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        syncQueue();
      }
    });

    return () => { unsub(); subscription.remove(); };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Nairobi Data Capture' }} />
            <Stack.Screen name="AddEntry" component={AddEntryScreen} options={{ title: 'Add Entry' }} />
            <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Submission History' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
