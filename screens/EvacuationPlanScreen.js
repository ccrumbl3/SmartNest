import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const EvacuationPlanScreen = ({ navigation }) => {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [actionSteps, setActionSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const readEvacuationPlan = async () => {
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
        console.log("Evacuation Plan loaded from Firestore:", data);
        setFamilyMembers(data.familyMembers || []);
        setActionSteps(data.actionSteps || []);
      } else {
        
        const defaultMembers = [
          { id: '1', name: 'Mom:', role: 'Get Emergency Kit' },
          { id: '2', name: 'Dad:', role: 'Turn Off Gas & Power' },
          { id: '3', name: 'Brother:', role: 'Gather Pets' },
          { id: '4', name: 'Sister:', role: 'Secure Documents' },
        ];
        const defaultSteps = [
          'Check all rooms for family members',
          'Exit through the nearest back door',
          'Meet at the designated neighborhood park',
        ];

        setFamilyMembers(defaultMembers);
        setActionSteps(defaultSteps);

        
        await setDoc(docRef, {
          familyMembers: defaultMembers,
          actionSteps: defaultSteps,
        }, { merge: true });
      }
    } catch (e) {
      console.error("Error reading evacuation plan: ", e);
    } finally {
      setLoading(false);
    }
  };

  
  useFocusEffect(
    useCallback(() => {
      readEvacuationPlan();
    }, [])
  );

 
  const handleRoleChange = (text, id, field) => {
    const updated = familyMembers.map((item) =>
      item.id === id ? { ...item, [field]: text } : item
    );
    setFamilyMembers(updated);
  };

  const handleAddFamilyMember = () => {
    const newMember = {
      id: Date.now().toString(),
      name: 'Name:',
      role: 'Assign Role',
    };
    setFamilyMembers([...familyMembers, newMember]);
  };

  const handleDeleteFamilyMember = (id) => {
    if (familyMembers.length <= 1) {
      Alert.alert('Notice', 'You must keep at least one family member role.');
      return;
    }
    setFamilyMembers(familyMembers.filter((item) => item.id !== id));
  };

 
  const handleStepChange = (text, index) => {
    const updated = [...actionSteps];
    updated[index] = text;
    setActionSteps(updated);
  };

  const handleAddStep = () => {
    setActionSteps([...actionSteps, 'New evacuation step']);
  };

  const handleDeleteStep = (index) => {
    if (actionSteps.length <= 1) {
      Alert.alert('Notice', 'You must keep at least one action step.');
      return;
    }
    const updated = actionSteps.filter((_, i) => i !== index);
    setActionSteps(updated);
  };

 
  const handleSaveAndGoBack = async () => {
    const userID = auth.currentUser?.uid;
    if (userID) {
      try {
        await setDoc(
          doc(db, 'emergencies', userID),
          {
            familyMembers,
            actionSteps,
          },
          { merge: true }
        );
        console.log("Evacuation Plan successfully updated in Firestore!");
      } catch (error) {
        console.error('Error saving evacuation plan: ', error);
      }
    }

    navigation.navigate({
      name: 'Emergency Center',
      params: {
        updatedMembers: familyMembers,
        updatedSteps: actionSteps,
      },
      merge: true,
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF4500" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading Evacuation Plan...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
       
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Evacuation Plan</Text>
          <View style={styles.titleUnderline} />
        </View>

        
        <Text style={styles.sectionTitle}>Family Roles</Text>
        
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

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.deleteIconButton}
                onPress={() => handleDeleteFamilyMember(item.id)}
              >
                <Text style={styles.deleteIconText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.addButton}
          onPress={handleAddFamilyMember}
        >
          <Text style={styles.addButtonText}>+ Add Family Member</Text>
        </TouchableOpacity>

       
        <View style={styles.planHeaderContainer}>
          <Text style={styles.sectionTitle}>Plan of Action Steps</Text>
        </View>

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
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.deleteStepButton}
                onPress={() => handleDeleteStep(index)}
              >
                <Text style={styles.deleteIconText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.addButton}
          onPress={handleAddStep}
        >
          <Text style={styles.addButtonText}>+ Add Evacuation Step</Text>
        </TouchableOpacity>

       
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.saveButton}
          onPress={handleSaveAndGoBack}
        >
          <Text style={styles.saveButtonText}>Save & Return</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default EvacuationPlanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAEAEA',
  },
  centered: {
    flex: 1,
    justify: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  headerTitle: {
    fontSize: 24,
    color: '#4A4A4A',
    textAlign: 'center',
  },
  titleUnderline: {
    height: 1.5,
    backgroundColor: '#A0A0A0',
    width: '70%',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: '5%',
  },
  rolesGrid: {
    width: '100%',
    gap: 8,
    marginBottom: 10,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonBox: {
    backgroundColor: '#EAEAEA',
    borderWidth: 1.5,
    borderColor: '#707070',
    borderRadius: 12,
    height: 44,
    justify: 'center',
    paddingHorizontal: 8,
  },
  nameBox: {
    flex: 1,
  },
  roleBox: {
    flex: 1.4,
  },
  inputText: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    padding: 0,
  },
  deleteIconButton: {
    padding: 6,
    justify: 'center',
    alignItems: 'center',
  },
  deleteIconText: {
    fontSize: 18,
  },
  addButton: {
    width: '90%',
    backgroundColor: '#EAEAEA',
    borderWidth: 1.5,
    borderColor: '#707070',
    borderRadius: 12,
    height: 40,
    justify: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
  },
  planHeaderContainer: {
    width: '100%',
    marginTop: 10,
  },
  actionListContainer: {
    width: '90%',
    gap: 12,
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletPoint: {
    fontSize: 18,
    color: '#333333',
    fontWeight: 'bold',
  },
  stepInput: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    borderBottomWidth: 1,
    borderBottomColor: '#707070',
    paddingBottom: 2,
    paddingTop: 0,
  },
  deleteStepButton: {
    paddingHorizontal: 4,
  },
  saveButton: {
    width: '90%',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 48,
    justify: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
