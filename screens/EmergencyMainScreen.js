import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

const EmergencyCenterScreen = ({ navigation, route }) => {
  const [emergencyNumber] = useState('911');

  // Shared state for cards
  const [familyMembers, setFamilyMembers] = useState([
    { id: '1', name: 'Mom:', role: 'Get Emergency Kit' },
    { id: '2', name: 'Dad:', role: 'Turn Off Gas & Power' },
    { id: '3', name: 'Brother:', role: 'Gather Pets' },
    { id: '4', name: 'Sister:', role: 'Secure Documents' },
  ]);

  const [emergencyKit, setEmergencyKit] = useState([
    { id: '1', name: 'Food', checked: false },
    { id: '2', name: 'First aid Kit', checked: false },
    { id: '3', name: 'Water', checked: false },
    { id: '4', name: 'flashlight', checked: false },
    { id: '5', name: 'radio', checked: false },
    { id: '6', name: 'batteries', checked: false },
  ]);

  // Meeting place state
  const [place1Name, setPlace1Name] = useState('Meeting place #1');
  const [place1Address, setPlace1Address] = useState('Central Park Oak Shelter');
  const [place2Name, setPlace2Name] = useState('Meeting place #2');
  const [place2Address, setPlace2Address] = useState('Community Center');

  const [actionSteps, setActionSteps] = useState([
    'Check all rooms for family members',
    'Exit through the nearest back door',
    'Meet at the designated neighborhood park',
  ]);

  // Listen for updated parameters returning from sub-screens
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.updatedMembers) setFamilyMembers(route.params.updatedMembers);
      if (route.params?.updatedKit) setEmergencyKit(route.params.updatedKit);
      if (route.params?.updatedSteps) setActionSteps(route.params.updatedSteps);
      if (route.params?.updatedPlace1Name) setPlace1Name(route.params.updatedPlace1Name);
      if (route.params?.updatedPlace1Address) setPlace1Address(route.params.updatedPlace1Address);
      if (route.params?.updatedPlace2Name) setPlace2Name(route.params.updatedPlace2Name);
      if (route.params?.updatedPlace2Address) setPlace2Address(route.params.updatedPlace2Address);
    }, [route.params])
  );

  const handleEmergencyCall = () => {
    Linking.openURL(`tel:${emergencyNumber}`);
  };

  const openGoogleMapsSearch = async (query) => {
    const encodedQuery = encodeURIComponent(query);
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

  const checkedKitCount = emergencyKit.filter((i) => i.checked).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.headerTitle}>Emergency Center</Text>

        <View style={styles.topSectionRow}>
          {/* Left Column */}
          <View style={styles.leftColumn}>
            <TouchableOpacity 
              activeOpacity={0.7} 
              style={styles.emergencyCallCard}
              onPress={handleEmergencyCall}
            >
              <Text style={styles.callCardText}>Emergency Call: {emergencyNumber}</Text>
            </TouchableOpacity>

            <View style={styles.mapsRow}>
              <TouchableOpacity 
                activeOpacity={0.8} 
                style={[styles.card, { flex: 1 }]}
                onPress={() => openGoogleMapsSearch('nearest shelter')}
              >
                <View style={styles.mapPlaceholder}>
                  <Text style={styles.mapIcon}>🗺️</Text>
                </View>
                <Text style={styles.cardLabelText}>Nearest shelter</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                activeOpacity={0.8} 
                style={[styles.card, { flex: 1 }]}
                onPress={() => openGoogleMapsSearch('nearest hospital')}
              >
                <View style={styles.mapPlaceholder}>
                  <Text style={styles.mapIcon}>🏥</Text>
                </View>
                <Text style={styles.cardLabelText}>Nearest hospital</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.rightColumn}>
            {/* 1. Family Roles Card */}
            <TouchableOpacity 
              activeOpacity={0.8} 
              style={[styles.card, { flex: 1 }]}
              onPress={() => navigation.navigate('Evacuation Plan', { familyMembers, actionSteps })}
            >
              <Text style={styles.sectionHeader}>Family Roles</Text>
              <ScrollView 
                nestedScrollEnabled={true} 
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.innerCardScroll}
              >
                {familyMembers.map((item) => (
                  <Text key={item.id} style={styles.roleItemText}>
                    <Text style={styles.roleNameText}>{item.name}</Text> {item.role}
                  </Text>
                ))}
              </ScrollView>
            </TouchableOpacity>

            {/* 2. Emergency Kit Card */}
            <TouchableOpacity 
              activeOpacity={0.8} 
              style={[styles.card, { flex: 1.2 }]}
              onPress={() => navigation.navigate('Emergency Kit', { emergencyKit })}
            >
              <Text style={styles.sectionHeader}>Emergency kit</Text>
              <Text style={styles.badgeText}>{checkedKitCount}/{emergencyKit.length} Ready</Text>
              <ScrollView 
                nestedScrollEnabled={true} 
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.innerCardScroll}
              >
                {emergencyKit.map((item) => (
                  <Text key={item.id} style={[styles.listItem, item.checked && styles.checkedItem]}>
                    - {item.name}
                  </Text>
                ))}
              </ScrollView>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomRow}>
          {/* 3. Meeting Place Card -> Opens MeetingPlanScreen */}
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={[styles.largeCard, { flex: 1 }]}
            onPress={() => navigation.navigate('Meeting Plan', {
              meetingPlace1Name: place1Name,
              meetingPlace1Address: place1Address,
              meetingPlace2Name: place2Name,
              meetingPlace2Address: place2Address,
            })}
          >
            <Text style={styles.sectionHeader}>Meeting place</Text>
            <ScrollView 
              nestedScrollEnabled={true} 
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.innerCardScroll}
            >
              <Text style={styles.placeHeader}>{place1Name}</Text>
              <Text style={styles.bodyText}>{place1Address}</Text>
              <Text style={[styles.placeHeader, { marginTop: 6 }]}>{place2Name}</Text>
              <Text style={styles.bodyText}>{place2Address}</Text>
            </ScrollView>
          </TouchableOpacity>

          {/* 4. Evacuation Plan Card -> Opens EvacuationPlanScreen */}
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={[styles.largeCard, { flex: 1.3 }]}
            onPress={() => navigation.navigate('Evacuation Plan', { familyMembers, actionSteps })}
          >
            <Text style={styles.sectionHeader}>Evacuation plan</Text>
            <ScrollView 
              nestedScrollEnabled={true} 
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.innerCardScroll}
            >
              {actionSteps.map((step, index) => (
                <Text key={index} style={styles.bodyText}>
                  - {step}
                </Text>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default EmergencyCenterScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAEAEA' },
  scrollContent: { padding: 16, gap: 12 },
  headerTitle: { fontSize: 26, color: '#333333', textAlign: 'center', marginVertical: 4 },
  topSectionRow: { flexDirection: 'row', gap: 10 },
  leftColumn: { flex: 1.8, gap: 10 },
  rightColumn: { flex: 1, gap: 10 },
  mapsRow: { flexDirection: 'row', gap: 8 },
  emergencyCallCard: {
    backgroundColor: '#EAEAEA',
    borderWidth: 1.5,
    borderColor: '#707070',
    borderRadius: 2,
    paddingVertical: 14,
    alignItems: 'center',
    justify: 'center',
  },
  callCardText: { color: '#333333', fontSize: 15 },
  card: {
    backgroundColor: '#EAEAEA',
    borderWidth: 1.5,
    borderColor: '#707070',
    borderRadius: 2,
    padding: 8,
    height: 140,
  },
  largeCard: {
    backgroundColor: '#EAEAEA',
    borderWidth: 1.5,
    borderColor: '#707070',
    borderRadius: 2,
    padding: 10,
    height: 140,
  },
  innerCardScroll: { paddingBottom: 6 },
  mapPlaceholder: {
    width: '100%',
    height: 60,
    backgroundColor: '#DCDCDC',
    marginBottom: 6,
    alignItems: 'center',
    justify: 'center',
  },
  mapIcon: { fontSize: 24 },
  cardLabelText: { fontSize: 11, color: '#333333', textAlign: 'center' },
  sectionHeader: { fontSize: 13, color: '#333333', marginBottom: 4, textAlign: 'center', fontWeight: 'bold' },
  badgeText: { fontSize: 10, color: '#388E3C', fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  listItem: { fontSize: 11, color: '#444444', textAlign: 'center', marginVertical: 1 },
  roleItemText: { fontSize: 10, color: '#444444', textAlign: 'center', marginVertical: 2 },
  roleNameText: { fontWeight: 'bold', color: '#222222' },
  checkedItem: { textDecorationLine: 'line-through', color: '#888888' },
  placeHeader: { fontSize: 11, fontWeight: 'bold', color: '#222222', textAlign: 'center' },
  bodyText: { fontSize: 10.5, color: '#555555', textAlign: 'center', marginTop: 1 },
  bottomRow: { flexDirection: 'row', gap: 10 },
});
