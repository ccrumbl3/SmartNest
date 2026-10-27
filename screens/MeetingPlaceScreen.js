import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Linking, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const MeetingPlaceScreen = ({ navigation }) => {
  const [place1Name, setPlace1Name] = useState('Meeting place #1');
  const [place1Address, setPlace1Address] = useState('');
  const [place2Name, setPlace2Name] = useState('Meeting place #2');
  const [place2Address, setPlace2Address] = useState('');
  const [loading, setLoading] = useState(true);

  
  const readMeetingPlan = async () => {
    const userID = auth.currentUser?.uid;
    if (!userID) {
      setLoading(false);
      return;
    }

    try {
      const docRef = doc(db, "emergencies", userID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Meeting Plan loaded from Firestore:", data);
        setPlace1Name(data.place1Name || 'Meeting place #1');
        setPlace1Address(data.place1Address || '');
        setPlace2Name(data.place2Name || 'Meeting place #2');
        setPlace2Address(data.place2Address || '');
      } else {
        
        const defaultP1Name = 'Meeting place #1';
        const defaultP1Address = 'Central Park Oak Shelter';
        const defaultP2Name = 'Meeting place #2';
        const defaultP2Address = 'Community Center';

        setPlace1Name(defaultP1Name);
        setPlace1Address(defaultP1Address);
        setPlace2Name(defaultP2Name);
        setPlace2Address(defaultP2Address);

        await setDoc(docRef, {
          place1Name: defaultP1Name,
          place1Address: defaultP1Address,
          place2Name: defaultP2Name,
          place2Address: defaultP2Address,
        }, { merge: true });
      }
    } catch (e) {
      console.error("Error reading meeting plan: ", e);
    } finally {
      setLoading(false);
    }
  };

  
  useFocusEffect(
    useCallback(() => {
      readMeetingPlan();
    }, [])
  );

  const openGoogleMapsSearch = async (address, defaultSearch) => {
    const queryToSearch = address.trim() !== '' ? address : defaultSearch;
    const encodedQuery = encodeURIComponent(queryToSearch);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;

    try {
      const supported = await Linking.canOpenURL(googleMapsUrl);
      if (supported) {
        await Linking.openURL(googleMapsUrl);
      } else {
        Alert.alert('Error', 'Unable to open Google Maps.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to launch maps.');
    }
  };

  
  const handleSaveAndExit = async () => {
    const userID = auth.currentUser?.uid;
    if (userID) {
      try {
        await setDoc(
          doc(db, 'emergencies', userID),
          {
            place1Name,
            place1Address,
            place2Name,
            place2Address,
          },
          { merge: true }
        );
        console.log("Meeting Plan successfully updated in Firestore!");
      } catch (error) {
        console.error('Error saving meeting plan: ', error);
      }
    }

    navigation.navigate({
      name: 'Emergency Center',
      params: {
        updatedPlace1Name: place1Name,
        updatedPlace1Address: place1Address,
        updatedPlace2Name: place2Name,
        updatedPlace2Address: place2Address,
      },
      merge: true,
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF4500" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading Meeting Plan...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Meeting Plan</Text>
          <View style={styles.titleUnderline} />
        </View>

      
        <View style={styles.sectionBlock}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.mapCardButton}
            onPress={() => openGoogleMapsSearch(place1Address, 'Central Park Shelter')}
          >
            <View style={styles.mapGraphicPlaceholder}>
              <Text style={styles.mapIcon}>🗺️</Text>
              <Text style={styles.mapHintText}>Tap to open in Google Maps</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Text style={styles.fieldLabel}>Label:</Text>
            <TextInput
              style={styles.textInput}
              value={place1Name}
              onChangeText={setPlace1Name}
              placeholder="e.g. Meeting place #1"
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.fieldLabel}>Address / Location:</Text>
            <TextInput
              style={styles.textInput}
              value={place1Address}
              onChangeText={setPlace1Address}
              placeholder="Enter street address or landmark"
              placeholderTextColor="#888"
            />
          </View>
        </View>

       
        <View style={styles.sectionBlock}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.mapCardButton}
            onPress={() => openGoogleMapsSearch(place2Address, 'Community Center')}
          >
            <View style={styles.mapGraphicPlaceholder}>
              <Text style={styles.mapIcon}>🏥</Text>
              <Text style={styles.mapHintText}>Tap to open in Google Maps</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Text style={styles.fieldLabel}>Label:</Text>
            <TextInput
              style={styles.textInput}
              value={place2Name}
              onChangeText={setPlace2Name}
              placeholder="e.g. Meeting place #2"
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.fieldLabel}>Address / Location:</Text>
            <TextInput
              style={styles.textInput}
              value={place2Address}
              onChangeText={setPlace2Address}
              placeholder="Enter street address or landmark"
              placeholderTextColor="#888"
            />
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.saveButton}
          onPress={handleSaveAndExit}
        >
          <Text style={styles.saveButtonText}>Save & Return</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default MeetingPlaceScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAEAEA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 16, alignItems: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 20, width: '100%' },
  headerTitle: { fontSize: 24, color: '#4A4A4A', textAlign: 'center' },
  titleUnderline: { height: 1.5, backgroundColor: '#A0A0A0', width: '70%', marginTop: 6 },
  sectionBlock: { width: '100%', alignItems: 'center', marginBottom: 24 },
  mapCardButton: {
    width: '85%',
    height: 110,
    backgroundColor: '#EAEAEA',
    borderWidth: 1.5,
    borderColor: '#707070',
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
    justify: 'center',
    marginBottom: 10,
  },
  mapGraphicPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#DCDCDC',
    borderRadius: 10,
    alignItems: 'center',
    justify: 'center',
  },
  mapIcon: { fontSize: 28 },
  mapHintText: { fontSize: 10, color: '#666666', marginTop: 4 },
  inputContainer: { width: '85%', marginBottom: 8 },
  fieldLabel: { fontSize: 12, color: '#555555', marginBottom: 2, fontWeight: '600' },
  textInput: {
    width: '100%',
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    borderWidth: 1.5,
    borderColor: '#707070',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  saveButton: {
    width: '85%',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 44,
    justify: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveButtonText: { fontSize: 16, color: '#FFFFFF', fontWeight: '600' },
});
