import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const EmergencyKitScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  
  const readEmergencyKit = async () => {
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
        console.log("Emergency Kit loaded from Firestore:", data.emergencyKit);
        setItems(data.emergencyKit || []);
      } else {
       
        const defaultKit = [
          { id: '1', name: 'Food', checked: false },
          { id: '2', name: 'First aid Kit', checked: false },
          { id: '3', name: 'Water', checked: false },
          { id: '4', name: 'flashlight', checked: false },
          { id: '5', name: 'radio', checked: false },
          { id: '6', name: 'batteries', checked: false },
        ];
        setItems(defaultKit);

        await setDoc(docRef, { emergencyKit: defaultKit }, { merge: true });
      }
    } catch (e) {
      console.error("Error reading emergency kit: ", e);
    } finally {
      setLoading(false);
    }
  };

  
  useFocusEffect(
    useCallback(() => {
      readEmergencyKit();
    }, [])
  );

  const toggleCheckbox = (id) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleAddItem = () => {
    if (newItemName.trim() === '') return;
    const newItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      checked: false,
    };
    setItems((prevItems) => [...prevItems, newItem]);
    setNewItemName('');
    setModalVisible(false);
  };

  const handleDeleteItem = (id) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  
  const handleSaveAndExit = async () => {
    const userID = auth.currentUser?.uid;
    if (userID) {
      try {
        await setDoc(
          doc(db, 'emergencies', userID),
          { emergencyKit: items },
          { merge: true }
        );
        console.log("Emergency Kit successfully updated in Firestore!");
      } catch (error) {
        console.error('Error saving emergency kit: ', error);
      }
    }

    navigation.navigate({
      name: 'Emergency Center',
      params: { updatedKit: items },
      merge: true,
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF4500" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading Emergency Kit...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Emergency kit</Text>
          <View style={styles.titleUnderline} />
        </View>

        <View style={styles.listContainer}>
          {items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={[styles.itemText, item.checked && styles.itemTextChecked]}>
                {item.name}
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.checkbox, item.checked && styles.checkboxChecked]}
                onPress={() => toggleCheckbox(item.id)}
                onLongPress={() => handleDeleteItem(item.id)}
              >
                {item.checked && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add Item</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.addButton, styles.saveExitButton]}
          onPress={handleSaveAndExit}
        >
          <Text style={[styles.addButtonText, { color: '#FFF' }]}>Save & Return</Text>
        </TouchableOpacity>

      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Emergency Item</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Item name (e.g. Blankets)"
              placeholderTextColor="#888"
              value={newItemName}
              onChangeText={setNewItemName}
              autoFocus={true}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddItem}
              >
                <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default EmergencyKitScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAEAEA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 16, alignItems: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 24, width: '100%' },
  headerTitle: { fontSize: 24, color: '#4A4A4A', textAlign: 'center' },
  titleUnderline: { height: 1.5, backgroundColor: '#A0A0A0', width: '70%', marginTop: 6 },
  listContainer: { width: '80%', gap: 12, marginBottom: 24 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemText: { fontSize: 18, color: '#333333', flex: 1, textAlign: 'center' },
  itemTextChecked: { textDecorationLine: 'line-through', color: '#888888' },
  checkbox: {
    width: 44,
    height: 32,
    borderWidth: 1.5,
    borderColor: '#707070',
    borderRadius: 8,
    backgroundColor: '#EAEAEA',
    justify: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#4CAF50', borderColor: '#388E3C' },
  checkmark: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  addButton: {
    width: '80%',
    backgroundColor: '#EAEAEA',
    borderWidth: 1.5,
    borderColor: '#707070',
    borderRadius: 12,
    height: 44,
    justify: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  saveExitButton: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  addButtonText: { fontSize: 16, color: '#333333' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justify: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#EAEAEA',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#707070',
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, color: '#333333', marginBottom: 16 },
  modalInput: {
    width: '100%',
    height: 40,
    borderWidth: 1.5,
    borderColor: '#707070',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    marginBottom: 16,
    fontSize: 14,
    color: '#333',
  },
  modalButtonRow: { flexDirection: 'row', gap: 12 },
  modalButton: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    justify: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#707070',
  },
  cancelButton: { backgroundColor: '#DCDCDC' },
  saveButton: { backgroundColor: '#FF4500', borderColor: '#FF4500' },
  modalButtonText: { fontSize: 14, color: '#333333' },
});
