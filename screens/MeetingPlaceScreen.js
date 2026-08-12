import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MeetingPlaceScreen = ({ navigation, route }) => {
  const [place1Name, setPlace1Name] = useState(
    route.params?.meetingPlace1Name || 'Meeting place #1'
  );
  const [place1Address, setPlace1Address] = useState(
    route.params?.meetingPlace1Address || 'Central Park Oak Shelter'
  );

  const [place2Name, setPlace2Name] = useState(
    route.params?.meetingPlace2Name || 'Meeting place #2'
  );
  const [place2Address, setPlace2Address] = useState(
    route.params?.meetingPlace2Address || 'Community Center'
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

  const handleSaveAndExit = () => {
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Meeting Plan</Text>
          <View style={styles.titleUnderline} />
        </View>

        {/* Meeting Place #1 */}
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

        {/* Meeting Place #2 */}
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
