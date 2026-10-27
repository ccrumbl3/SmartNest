import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Linking, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const EmergencyCenterScreen = ({ navigation, route }) => {
  const userID = auth.currentUser?.uid;
  const [loading, setLoading] = useState(true);
  const [emergencyNumber] = useState('911');

 
  const [familyMembers, setFamilyMembers] = useState([]);
  const [emergencyKit, setEmergencyKit] = useState([]);
  const [place1Name, setPlace1Name] = useState('Meeting place #1');
  const [place1Address, setPlace1Address] = useState('');
  const [place2Name, setPlace2Name] = useState('Meeting place #2');
  const [place2Address, setPlace2Address] = useState('');
  const [actionSteps, setActionSteps] = useState([]);

 
  const [medicalSummary, setMedicalSummary] = useState({
    hospitalCount: 0,
    insuranceProvider: 'None',
    prescriptionsCount: 0,
    allergies: [],
    primaryAllergy: 'None',
  });

 
  useFocusEffect(
    React.useCallback(() => {
      if (!userID) {
        setLoading(false);
        return;
      }

      let isMounted = true;

      const fetchEmergencyAndMedicalData = async () => {
        try {
          
          const docRef = doc(db, 'emergencies', userID);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists() && isMounted) {
            const data = docSnap.data();
            setFamilyMembers(data.familyMembers || []);
            setEmergencyKit(data.emergencyKit || []);
            setPlace1Name(data.place1Name || 'Meeting place #1');
            setPlace1Address(data.place1Address || '');
            setPlace2Name(data.place2Name || 'Meeting place #2');
            setPlace2Address(data.place2Address || '');
            setActionSteps(data.actionSteps || []);
          } else if (isMounted) {
            const defaultMembers = [
              { id: '1', name: 'Mom:', role: 'Get Emergency Kit' },
              { id: '2', name: 'Dad:', role: 'Turn Off Gas & Power' },
              { id: '3', name: 'Brother:', role: 'Gather Pets' },
              { id: '4', name: 'Sister:', role: 'Secure Documents' },
            ];
            const defaultKit = [
              { id: '1', name: 'Food', checked: false },
              { id: '2', name: 'First aid Kit', checked: false },
              { id: '3', name: 'Water', checked: false },
              { id: '4', name: 'Flashlight', checked: false },
              { id: '5', name: 'Radio', checked: false },
              { id: '6', name: 'Batteries', checked: false },
            ];
            const defaultSteps = [
              'Check all rooms for family members',
              'Exit through the nearest back door',
              'Meet at the designated neighborhood park',
            ];

            setFamilyMembers(defaultMembers);
            setEmergencyKit(defaultKit);
            setActionSteps(defaultSteps);
            setPlace1Address('Central Park Oak Shelter');
            setPlace2Address('Community Center');

            await setDoc(docRef, {
              familyMembers: defaultMembers,
              emergencyKit: defaultKit,
              place1Name: 'Meeting place #1',
              place1Address: 'Central Park Oak Shelter',
              place2Name: 'Meeting place #2',
              place2Address: 'Community Center',
              actionSteps: defaultSteps,
            });
          }

         
          const medDocRef = doc(db, 'medicalRecords', userID);
          const medDocSnap = await getDoc(medDocRef);

          if (medDocSnap.exists() && isMounted) {
            const medData = medDocSnap.data();
            const visits = medData.hospitalVisits || [];
            const insurance = medData.insuranceList || [];
            const rx = medData.prescriptions || [];
            const allergyList = medData.allergies || [];

            setMedicalSummary({
              hospitalCount: visits.length,
              insuranceProvider: insurance.length > 0 ? insurance[0].provider : 'None Listed',
              prescriptionsCount: rx.length,
              allergies: allergyList,
              primaryAllergy: allergyList.length > 0 ? allergyList[0].allergen : 'None Reported',
            });
          }
        } catch (error) {
          console.error('Error fetching data from Firebase:', error);
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      fetchEmergencyAndMedicalData();

      if (route.params) {
        if (route.params.updatedMembers) setFamilyMembers(route.params.updatedMembers);
        if (route.params.updatedKit) setEmergencyKit(route.params.updatedKit);
        if (route.params.updatedSteps) setActionSteps(route.params.updatedSteps);
        if (route.params.updatedPlace1Name !== undefined) setPlace1Name(route.params.updatedPlace1Name);
        if (route.params.updatedPlace1Address !== undefined) setPlace1Address(route.params.updatedPlace1Address);
        if (route.params.updatedPlace2Name !== undefined) setPlace2Name(route.params.updatedPlace2Name);
        if (route.params.updatedPlace2Address !== undefined) setPlace2Address(route.params.updatedPlace2Address);
      }

      return () => {
        isMounted = false;
      };
    }, [userID, route.params])
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={styles.loadingText}>Preparing Emergency Center...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
       
        <View style={styles.headerBox}>
          <Text style={styles.headerTitle}>Emergency Center</Text>
          <Text style={styles.headerSubtitle}>Quick access to family safety protocols & contacts</Text>
        </View>

       
        <View style={styles.topSectionRow}>
          
         
          <View style={styles.leftColumn}>
          
            <TouchableOpacity 
              activeOpacity={0.85} 
              style={styles.emergencyCallCard}
              onPress={handleEmergencyCall}
            >
              <View style={styles.callIconBadge}>
                <Text style={{ fontSize: 16 }}>📞</Text>
              </View>
              <View>
                <Text style={styles.callLabel}>Emergency Call</Text>
                <Text style={styles.callNumber}>{emergencyNumber}</Text>
              </View>
            </TouchableOpacity>

           
            <View style={styles.mapsRow}>
              <TouchableOpacity 
                activeOpacity={0.85} 
                style={[styles.card, styles.mapCard]}
                onPress={() => openGoogleMapsSearch('nearest shelter')}
              >
                <View style={[styles.mapPlaceholder, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={styles.mapIcon}>⛺</Text>
                </View>
                <Text style={styles.cardLabelText}>Nearest Shelter</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                activeOpacity={0.85} 
                style={[styles.card, styles.mapCard]}
                onPress={() => openGoogleMapsSearch('nearest hospital')}
              >
                <View style={[styles.mapPlaceholder, { backgroundColor: '#DBEAFE' }]}>
                  <Text style={styles.mapIcon}>🏥</Text>
                </View>
                <Text style={styles.cardLabelText}>Nearest Hospital</Text>
              </TouchableOpacity>
            </View>
          </View>

         
          <View style={styles.rightColumn}>
            
            
            <TouchableOpacity 
              activeOpacity={0.85} 
              style={styles.card}
              onPress={() => navigation.navigate('Evacuation Plan', { familyMembers, actionSteps })}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={styles.sectionHeader}>Family Roles</Text>
                <Text style={styles.arrowIcon}>→</Text>
              </View>
              <View pointerEvents="none" style={styles.innerContentBox}>
                {familyMembers.slice(0, 3).map((item) => (
                  <View key={item.id} style={styles.roleLine}>
                    <Text style={styles.roleBullet}>•</Text>
                    <Text style={styles.roleText} numberOfLines={1}>
                      <Text style={styles.roleNameText}>{item.name} </Text>
                      {item.role}
                    </Text>
                  </View>
                ))}
                {familyMembers.length > 3 && (
                  <Text style={styles.moreText}>+{familyMembers.length - 3} more</Text>
                )}
              </View>
            </TouchableOpacity>

            
            <TouchableOpacity 
              activeOpacity={0.85} 
              style={styles.card}
              onPress={() => navigation.navigate('Emergency Kit', { emergencyKit })}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={styles.sectionHeader}>Emergency Kit</Text>
                <View style={[styles.badge, checkedKitCount === emergencyKit.length && emergencyKit.length > 0 ? styles.badgeSuccess : styles.badgePending]}>
                  <Text style={styles.badgeText}>{checkedKitCount}/{emergencyKit.length} Ready</Text>
                </View>
              </View>
              <View pointerEvents="none" style={styles.innerContentBox}>
                {emergencyKit.slice(0, 3).map((item) => (
                  <View key={item.id} style={styles.kitLine}>
                    <Text style={[styles.kitCheckIcon, item.checked && styles.kitCheckIconChecked]}>
                      {item.checked ? '✓' : '○'}
                    </Text>
                    <Text style={[styles.kitText, item.checked && styles.kitTextChecked]} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>

          </View>
        </View>

    
        <View style={styles.bottomRow}>
          
          
          <TouchableOpacity 
            activeOpacity={0.85} 
            style={[styles.card, styles.largeCard]}
            onPress={() => navigation.navigate('MeetingPlace', {
              meetingPlace1Name: place1Name,
              meetingPlace1Address: place1Address,
              meetingPlace2Name: place2Name,
              meetingPlace2Address: place2Address,
            })}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={styles.sectionHeader}>Meeting Places</Text>
              <Text style={styles.arrowIcon}>→</Text>
            </View>
            <View pointerEvents="none" style={styles.innerContentBox}>
              <View style={styles.placeItem}>
                <Text style={styles.placeTitle} numberOfLines={1}>📍 {place1Name}</Text>
                <Text style={styles.placeSubtitle} numberOfLines={1}>{place1Address || 'Tap to set address'}</Text>
              </View>
              <View style={[styles.placeItem, { marginTop: 6 }]}>
                <Text style={styles.placeTitle} numberOfLines={1}>📍 {place2Name}</Text>
                <Text style={styles.placeSubtitle} numberOfLines={1}>{place2Address || 'Tap to set address'}</Text>
              </View>
            </View>
          </TouchableOpacity>

        
          <TouchableOpacity 
            activeOpacity={0.85} 
            style={[styles.card, styles.largeCard]}
            onPress={() => navigation.navigate('Evacuation Plan', { familyMembers, actionSteps })}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={styles.sectionHeader}>Evacuation Plan</Text>
              <Text style={styles.arrowIcon}>→</Text>
            </View>
            <View pointerEvents="none" style={styles.innerContentBox}>
              {actionSteps.slice(0, 3).map((step, index) => (
                <View key={index} style={styles.stepLine}>
                  <Text style={styles.stepNumberBadge}>{index + 1}</Text>
                  <Text style={styles.stepText} numberOfLines={1}>{step}</Text>
                </View>
              ))}
              {actionSteps.length > 3 && (
                <Text style={styles.moreText}>+{actionSteps.length - 3} more steps</Text>
              )}
            </View>
          </TouchableOpacity>

        </View>

       
        <TouchableOpacity 
          activeOpacity={0.85} 
          style={[styles.card, styles.medicalCard]}
          onPress={() => navigation.navigate('Hospital Medical')}
        >
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 16 }}>🩺</Text>
              <Text style={styles.sectionHeader}>Medical & Health Records</Text>
            </View>
            <View style={styles.medBadge}>
              <Text style={styles.medBadgeText}>Tap to Edit →</Text>
            </View>
          </View>

          <View pointerEvents="none" style={styles.medicalGrid}>
            <View style={styles.medicalGridItem}>
              <Text style={styles.medicalLabel}>🛡️ Insurance</Text>
              <Text style={styles.medicalVal} numberOfLines={1}>{medicalSummary.insuranceProvider}</Text>
            </View>

            <View style={styles.medicalGridItem}>
              <Text style={styles.medicalLabel}>💊 Prescriptions</Text>
              <Text style={styles.medicalVal} numberOfLines={1}>
                {medicalSummary.prescriptionsCount > 0 ? `${medicalSummary.prescriptionsCount} Active` : 'None'}
              </Text>
            </View>

            <View style={styles.medicalGridItem}>
              <Text style={styles.medicalLabel}>⚠️ Known Allergies</Text>
              <Text style={[styles.medicalVal, { color: medicalSummary.allergies.length > 0 ? '#DC2626' : '#334155' }]} numberOfLines={1}>
                {medicalSummary.primaryAllergy}
              </Text>
            </View>

            <View style={styles.medicalGridItem}>
              <Text style={styles.medicalLabel}>🏥 Hospital Visits</Text>
              <Text style={styles.medicalVal} numberOfLines={1}>
                {medicalSummary.hospitalCount > 0 ? `${medicalSummary.hospitalCount} Logged` : '0 Recorded'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default EmergencyCenterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 30,
  },
  headerBox: {
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  topSectionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  leftColumn: {
    flex: 1.4,
    gap: 12,
  },
  rightColumn: {
    flex: 1.6,
    gap: 12,
  },
  emergencyCallCard: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    elevation: 3,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  callIconBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callLabel: {
    color: '#FEE2E2',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  callNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  mapsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  mapCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  mapPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapIcon: {
    fontSize: 20,
  },
  cardLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  arrowIcon: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
  },
  badgePending: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803D',
  },
  innerContentBox: {
    gap: 4,
  },
  roleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roleBullet: {
    color: '#64748B',
    fontSize: 12,
  },
  roleText: {
    fontSize: 11,
    color: '#475569',
    flex: 1,
  },
  roleNameText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  moreText: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  kitLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  kitCheckIcon: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  kitCheckIconChecked: {
    color: '#10B981',
  },
  kitText: {
    fontSize: 11,
    color: '#475569',
    flex: 1,
  },
  kitTextChecked: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 12,
  },
  largeCard: {
    flex: 1,
    minHeight: 125,
  },
  placeItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 6,
  },
  placeTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  placeSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  stepLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 1,
  },
  stepNumberBadge: {
    backgroundColor: '#E2E8F0',
    color: '#475569',
    fontSize: 9,
    fontWeight: '700',
    borderRadius: 10,
    width: 16,
    height: 16,
    textAlign: 'center',
    lineHeight: 16,
  },
  stepText: {
    fontSize: 11,
    color: '#334155',
    flex: 1,
  },
  medicalCard: {
    marginTop: 2,
    borderColor: '#BAE6FD',
    backgroundColor: '#F0F9FF',
  },
  medBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  medBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
  },
  medicalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  medicalGridItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  medicalLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  medicalVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
});
