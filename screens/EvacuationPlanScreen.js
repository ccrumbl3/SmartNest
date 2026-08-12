import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EvacuationPlanScreen = ({ navigation, route }) => {
  const [familyMembers, setFamilyMembers] = useState(
    route.params?.familyMembers || [
      { id: '1', name: 'Mom:', role: 'Get Emergency Kit' },
      { id: '2', name: 'Dad:', role: 'Turn Off Gas & Power' },
      { id: '3', name: 'Brother:', role: 'Gather Pets' },
      { id: '4', name: 'Sister:', role: 'Secure Documents' },
    ]
  );

  const [actionSteps, setActionSteps] = useState(
    route.params?.actionSteps || [
      'Check all rooms for family members',
      'Exit through the nearest back door',
      'Meet at the designated neighborhood park',
    ]
  );

  const [meetingPlace, setMeetingPlace] = useState(
    route.params?.meetingPlace || 'Designated Park'
  );

  // Update local state without triggering navigation
  const handleRoleChange = (text, id, field) => {
    const updated = familyMembers.map((item) =>
      item.id === id ? { ...item, [field]: text } : item
    );
    setFamilyMembers(updated);
  };

  const handleStepChange = (text, index) => {
    const updated = [...actionSteps];
    updated[index] = text;
    setActionSteps(updated);
  };

  // Save changes and explicitly return to main screen
  const handleSaveAndGoBack = () => {
    navigation.navigate({
      name: 'Emergency Center',
      params: {
        updatedMembers: familyMembers,
        updatedSteps: actionSteps,
        updatedMeetingPlace: meetingPlace,
      },
      merge: true,
    });
    Alert.alert('Saved', 'Your changes have been updated!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Evacuation Plan</Text>
          <View style={styles.titleUnderline} />
        </View>

        {/* Family Roles Grid */}
        <View style={styles.rolesGrid}>
          {familyMembers.map((item) => (
            <View key={item.id} style={styles.roleRow}>
              <View style={[styles.buttonBox, styles.nameBox]}>
                <TextInput
                  style={styles.inputText}
                  value={item.name}
                  onChangeText={(text) => handleRoleChange(text, item.id, 'name')}
                  placeholder="Name:"
                  placeholderTextColor="#888"
                />
              </View>

              <View style={[styles.buttonBox, styles.roleBox]}>
                <TextInput
                  style={styles.inputText}
                  value={item.role}
                  onChangeText={(text) => handleRoleChange(text, item.id, 'role')}
                  placeholder="Role"
                  placeholderTextColor="#888"
                />
              </View>
            </View>
          ))}
        </View>

        {/* Plan of Action Header / Save Button */}
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.planActionHeaderButton}
          onPress={handleSaveAndGoBack}
        >
          <Text style={styles.planActionHeaderText}>Save Plan of Action</Text>
        </TouchableOpacity>

        {/* Plan of Action List */}
        <View style={styles.actionListContainer}>
          {actionSteps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <Text style={styles.bulletPoint}>-</Text>
              <TextInput
                style={styles.stepInput}
                value={step}
                onChangeText={(text) => handleStepChange(text, index)}
                placeholder="Enter step details..."
                placeholderTextColor="#888"
              />
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default EvacuationPlanScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAEAEA' },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 16, alignItems: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 20, width: '100%' },
  headerTitle: { fontSize: 24, color: '#4A4A4A', textAlign: 'center' },
  titleUnderline: { height: 1.5, backgroundColor: '#A0A0A0', width: '70%', marginTop: 6 },
  rolesGrid: { width: '100%', gap: 8, marginBottom: 20 },
  roleRow: { flexDirection: 'row', gap: 8 },
  buttonBox: {
    backgroundColor: '#EAEAEA',
    borderWidth: 1.5,
    borderColor: '#707070',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  nameBox: { flex: 1 },
  roleBox: { flex: 1.2 },
  inputText: { fontSize: 15, color: '#333333', textAlign: 'center', padding: 0 },
  planActionHeaderButton: {
    width: '100%',
    backgroundColor: '#EAEAEA',
    borderWidth: 1.5,
    borderColor: '#707070',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  planActionHeaderText: { fontSize: 17, color: '#333333' },
  actionListContainer: { width: '90%', gap: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bulletPoint: { fontSize: 18, color: '#333333', fontWeight: 'bold' },
  stepInput: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    borderBottomWidth: 1,
    borderBottomColor: '#707070',
    paddingBottom: 2,
    paddingTop: 0,
  },
});
