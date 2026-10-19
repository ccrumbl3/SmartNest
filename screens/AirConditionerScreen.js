import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Divider, SegmentedButtons } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const WEEKS_PER_MONTH = 52 / 12;

const AirConditionerScreen = ({ navigation }) => {
  const userID = auth.currentUser?.uid;
  const [loading, setLoading] = useState(true);

  // Inputs
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('19:00');
  const [tempF, setTempF] = useState('72');
  const [acType, setAcType] = useState('central'); // 'central' | 'mini' | 'window'
  const [ratePerKwh, setRatePerKwh] = useState(0.22);

  // Results State
  const [analysisResult, setAnalysisResult] = useState(null);

  // Load electricity rate from Firestore
  const fetchRate = async () => {
    if (!userID) {
      setLoading(false);
      return;
    }
    try {
      const docRef = doc(db, 'electricity', userID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.ratePerKwh !== undefined) {
          setRatePerKwh(Number(data.ratePerKwh));
        }
      }
    } catch (e) {
      console.error('Error loading electricity rate:', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRate();
    }, [userID])
  );

  // Flexible duration parser
  const parseDurationHours = (start, end) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    const s = (start || '').trim();
    const e = (end || '').trim();

    if (timeRegex.test(s) && timeRegex.test(e)) {
      const [sh, sm] = s.split(':').map(Number);
      const [eh, em] = e.split(':').map(Number);

      let diff = eh * 60 + em - (sh * 60 + sm);
      if (diff < 0) diff += 24 * 60; // Spans midnight
      return diff / 60;
    }
    return null;
  };

  // Base power based on AC unit type
  const getBaseKw = (type) => {
    switch (type) {
      case 'central':
        return 3.5; // ~3500 Watts typical central AC
      case 'mini':
        return 1.5; // ~1500 Watts mini-split / portable
      case 'window':
        return 0.9; // ~900 Watts room window AC
      default:
        return 3.0;
    }
  };

  // =========================================================
  // CALCULATE AC RUNTIME & SMART RECOMMENDATIONS
  // =========================================================
  const handleCalculate = () => {
    const duration = parseDurationHours(startTime, endTime);
    if (!duration || duration <= 0) {
      Alert.alert(
        'Invalid Time Format',
        'Please enter valid start and end times (e.g. 14:00 and 19:00).'
      );
      return;
    }

    const currentTemp = parseInt(tempF, 10);
    if (isNaN(currentTemp) || currentTemp < 60 || currentTemp > 85) {
      Alert.alert('Invalid Temperature', 'Please set a temperature between 60°F and 85°F.');
      return;
    }

    const baseKw = getBaseKw(acType);

    // Energy Star benchmark is 78°F.
    // Each degree below 78°F increases cooling compressor load by ~4.5%.
    const tempDifference = Math.max(78 - currentTemp, 0);
    const tempLoadMultiplier = 1 + tempDifference * 0.045;
    const effectiveKw = baseKw * tempLoadMultiplier;

    // Current Costs
    const sessionKwh = effectiveKw * duration;
    const sessionCost = sessionKwh * ratePerKwh;
    const monthlyCost = sessionCost * 7 * WEEKS_PER_MONTH;

    // Optimal Recommended Setting: 76°F - 78°F
    const recommendedTemp = 78;
    const recommendedDiffDegrees = Math.max(recommendedTemp - currentTemp, 0);
    const recLoadMultiplier = 1; // At 78°F, multiplier is 1.0
    const recEffectiveKw = baseKw * recLoadMultiplier;
    const recSessionKwh = recEffectiveKw * duration;
    const recSessionCost = recSessionKwh * ratePerKwh;
    const recMonthlyCost = recSessionCost * 7 * WEEKS_PER_MONTH;

    const savedPerSession = Math.max(sessionCost - recSessionCost, 0);
    const savedMonthly = Math.max(monthlyCost - recMonthlyCost, 0);

    // Time-of-Use Peak Hour Inspection (4:00 PM to 9:00 PM)
    const [startH] = startTime.split(':').map(Number);
    const [endH] = endTime.split(':').map(Number);
    const overlapsPeakHours =
      (startH >= 16 && startH < 21) ||
      (endH > 16 && endH <= 21) ||
      (startH <= 16 && endH >= 21);

    let recommendedTimeTip = 'Pre-cool your home earlier (1:00 PM – 3:30 PM) before 4 PM peak rates.';
    if (!overlapsPeakHours) {
      recommendedTimeTip = 'Your current schedule runs outside peak hours (4 PM – 9 PM), saving on peak surcharges.';
    }

    setAnalysisResult({
      durationHours: duration,
      effectiveKw,
      sessionKwh,
      sessionCost,
      monthlyCost,
      currentTemp,
      recommendedTemp,
      recommendedDiffDegrees,
      savedPerSession,
      savedMonthly,
      overlapsPeakHours,
      recommendedTimeTip,
    });
  };

  // =========================================================
  // SAVE AC TO MAIN DASHBOARD
  // =========================================================
  const handleSaveToDashboard = async () => {
    if (!analysisResult) {
      Alert.alert('Calculate First', 'Press Calculate Cost & Tips before saving.');
      return;
    }

    try {
      const docRef = doc(db, 'electricity', userID);
      const snap = await getDoc(docRef);

      const existingItems = snap.exists() ? snap.data().loggedAppliances || [] : [];
      const updatedList = [
        {
          id: Date.now().toString(),
          name: `Air Conditioner (${tempF}°F)`,
          startTime,
          endTime,
          durationHours: Number(analysisResult.durationHours.toFixed(1)),
          powerKw: Number(analysisResult.effectiveKw.toFixed(2)),
          kwh: Number(analysisResult.sessionKwh.toFixed(2)),
          cost: Number(analysisResult.sessionCost.toFixed(2)),
          usesPerWeek: 7,
          ratePerKwh,
          projectedMonthlyCost: Number(analysisResult.monthlyCost.toFixed(2)),
        },
        ...existingItems.filter((i) => !i.name.includes('Air Conditioner')),
      ];

      const newTotalKwh = updatedList.reduce((sum, item) => sum + Number(item.kwh || 0), 0);

      await setDoc(
        docRef,
        {
          loggedAppliances: updatedList,
          totalKwh: newTotalKwh,
          ratePerKwh,
        },
        { merge: true }
      );

      Alert.alert('Saved to Dashboard', 'Air conditioner schedule and cost synced to your Home Dashboard.');
    } catch (e) {
      console.error('Error saving AC settings:', e);
      Alert.alert('Save Failed', 'Could not sync with Firebase.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10, color: '#64748B' }}>Loading AC Smart Manager...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.headerBox}>
          <Text style={styles.eyebrow}>CLIMATE OPTIMIZER</Text>
          <Text style={styles.headerTitle}>Air Conditioner Cost & Savings</Text>
          <Text style={styles.headerSubtitle}>
            Calculate running costs by set temperature and find optimal schedules to cut electric bills.
          </Text>
        </View>

        {/* 1. Unit Type Selector */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>AC Unit Type</Text>
            <SegmentedButtons
              value={acType}
              onValueChange={setAcType}
              buttons={[
                { value: 'central', label: 'Central (3.5kW)' },
                { value: 'mini', label: 'Mini-Split (1.5kW)' },
                { value: 'window', label: 'Window (0.9kW)' },
              ]}
              style={styles.segmentedButtons}
            />

            {/* Start and End Times */}
            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Start Time (24h)</Text>
                <TextInput
                  style={styles.input}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="14:00"
                  placeholderTextColor="#94A3B8"
                  maxLength={5}
                />
              </View>

              <View style={styles.arrowBox}>
                <Text style={styles.arrowText}>→</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>End Time (24h)</Text>
                <TextInput
                  style={styles.input}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="19:00"
                  placeholderTextColor="#94A3B8"
                  maxLength={5}
                />
              </View>
            </View>

            {/* Set Temperature Section */}
            <Text style={styles.inputLabel}>Thermostat Set Temperature (°F)</Text>
            <View style={styles.tempSelectorRow}>
              <TouchableOpacity
                style={styles.tempAdjustBtn}
                onPress={() => setTempF((prev) => Math.max(parseInt(prev || 72, 10) - 1, 60).toString())}
              >
                <Text style={styles.tempAdjustBtnText}>−</Text>
              </TouchableOpacity>

              <View style={styles.tempDisplayBox}>
                <Text style={styles.tempNumberText}>{tempF}°F</Text>
                <Text style={styles.tempSubText}>Current Setpoint</Text>
              </View>

              <TouchableOpacity
                style={styles.tempAdjustBtn}
                onPress={() => setTempF((prev) => Math.min(parseInt(prev || 72, 10) + 1, 85).toString())}
              >
                <Text style={styles.tempAdjustBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Action Calculate Button */}
            <Button
              mode="contained"
              buttonColor="#2563EB"
              textColor="#FFFFFF"
              icon="calculator"
              style={styles.calcButton}
              onPress={handleCalculate}
            >
              Calculate Cost & Recommendations
            </Button>
          </Card.Content>
        </Card>

        {/* 2. Cost Analysis Card */}
        {analysisResult && (
          <>
            <Card style={styles.costHeroCard}>
              <Card.Content>
                <View style={styles.costHeaderRow}>
                  <View>
                    <Text style={styles.costLabelLight}>ESTIMATED SESSION COST</Text>
                    <Text style={styles.costBigPrice}>${analysisResult.sessionCost.toFixed(2)}</Text>
                    <Text style={styles.costSubKwh}>
                      {analysisResult.sessionKwh.toFixed(1)} kWh • {analysisResult.durationHours.toFixed(1)} hrs runtime
                    </Text>
                  </View>
                  <View style={styles.iconCircle}>
                    <Text style={{ fontSize: 24 }}>❄️</Text>
                  </View>
                </View>

                <Divider style={styles.heroDivider} />

                <View style={styles.monthlyProjRow}>
                  <Text style={styles.projLabel}>Projected Monthly AC Bill (7 days/wk):</Text>
                  <Text style={styles.projVal}>${analysisResult.monthlyCost.toFixed(2)}/mo</Text>
                </View>
              </Card.Content>
            </Card>

            {/* 3. Smart Recommendations Card */}
            <Card style={styles.recommendCard}>
              <Card.Content>
                <View style={styles.recHeaderRow}>
                  <Text style={styles.recTitle}>💡 Money-Saving Strategy</Text>
                  <Text style={styles.recBadge}>AI Optimized</Text>
                </View>

                {/* Temperature Advice */}
                <View style={styles.tipBox}>
                  <Text style={styles.tipHeading}>
                    Recommended Temperature: {analysisResult.recommendedTemp}°F
                  </Text>
                  {analysisResult.recommendedDiffDegrees > 0 ? (
                    <Text style={styles.tipBody}>
                      Setting your thermostat to <Text style={styles.bold}>{analysisResult.recommendedTemp}°F</Text> (raising it by {analysisResult.recommendedDiffDegrees}°F) will save approximately{' '}
                      <Text style={styles.greenText}>${analysisResult.savedPerSession.toFixed(2)} per run</Text> or{' '}
                      <Text style={styles.greenText}>~${analysisResult.savedMonthly.toFixed(2)}/month</Text>.
                    </Text>
                  ) : (
                    <Text style={styles.tipBody}>
                      Great job! Your thermostat is already set at the optimal efficiency threshold (78°F).
                    </Text>
                  )}
                </View>

                {/* Peak Hours Time Advice */}
                <View style={[styles.tipBox, { marginTop: 8 }]}>
                  <Text style={styles.tipHeading}>
                    {analysisResult.overlapsPeakHours ? '⚠️ Peak Hour Usage Warning' : '⏰ Timing Recommendation'}
                  </Text>
                  <Text style={styles.tipBody}>{analysisResult.recommendedTimeTip}</Text>
                </View>

                {/* Quick Set Action Button */}
                <Button
                  mode="contained"
                  buttonColor="#16A34A"
                  textColor="#FFFFFF"
                  icon="check-circle"
                  style={styles.applyBtn}
                  onPress={handleSaveToDashboard}
                >
                  Save AC Schedule to Dashboard
                </Button>
              </Card.Content>
            </Card>
          </>
        )}

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Return to Dashboard</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default AirConditionerScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16, gap: 14, paddingBottom: 40 },
  headerBox: { marginBottom: 2 },
  eyebrow: { fontSize: 10.5, fontWeight: '800', color: '#2563EB', letterSpacing: 1.2 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5, marginTop: 2 },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 4, lineHeight: 18 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  segmentedButtons: { marginBottom: 14 },
  rowInputs: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  arrowBox: { width: 28, alignItems: 'center', paddingTop: 14 },
  arrowText: { fontSize: 18, color: '#94A3B8' },
  inputLabel: { fontSize: 11.5, fontWeight: '600', color: '#475569', marginBottom: 4 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  tempSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 6,
  },
  tempAdjustBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempAdjustBtnText: { fontSize: 22, fontWeight: 'bold', color: '#2563EB' },
  tempDisplayBox: { alignItems: 'center', minWidth: 120 },
  tempNumberText: { fontSize: 32, fontWeight: '800', color: '#0F172A' },
  tempSubText: { fontSize: 10, color: '#64748B' },
  calcButton: { borderRadius: 10, marginTop: 12, paddingVertical: 2 },
  costHeroCard: { backgroundColor: '#0F172A', borderRadius: 16, elevation: 2 },
  costHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  costLabelLight: { fontSize: 9.5, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.8 },
  costBigPrice: { fontSize: 36, fontWeight: '800', color: '#FFFFFF', marginTop: 2 },
  costSubKwh: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDivider: { backgroundColor: '#334155', height: 1, marginVertical: 12 },
  monthlyProjRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  projLabel: { fontSize: 11, color: '#94A3B8' },
  projVal: { fontSize: 14, fontWeight: '800', color: '#38BDF8' },
  recommendCard: { backgroundColor: '#F0FDF4', borderRadius: 16, borderWidth: 1, borderColor: '#BBF7D0' },
  recHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  recTitle: { fontSize: 14, fontWeight: '800', color: '#166534' },
  recBadge: { fontSize: 9.5, fontWeight: '700', color: '#15803D', backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  tipBox: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#DCFCE7' },
  tipHeading: { fontSize: 12, fontWeight: '700', color: '#166534', marginBottom: 3 },
  tipBody: { fontSize: 11.5, color: '#374151', lineHeight: 17 },
  bold: { fontWeight: '700', color: '#0F172A' },
  greenText: { fontWeight: '800', color: '#15803D' },
  applyBtn: { borderRadius: 10, marginTop: 12 },
  backButton: {
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  backButtonText: { fontSize: 13, fontWeight: '600', color: '#334155' },
});
