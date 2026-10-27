import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const ElectricMainScreen = ({ navigation }) => {
  const userID = auth.currentUser?.uid;
  const [loading, setLoading] = useState(true);

  const [totalKwh, setTotalKwh] = useState(0);
  const [ratePerKwh, setRatePerKwh] = useState(0.22);
  const [loggedAppliances, setLoggedAppliances] = useState([]);

  const [billHistory] = useState([
    { month: 'Aug', amount: 108.32 },
    { month: 'Jul', amount: 102.14 },
    { month: 'Jun', amount: 115.08 },
  ]);

  const fetchElectricData = async () => {
    if (!userID) {
      setLoading(false);
      return;
    }

    try {
      const docRef = doc(db, 'electricity', userID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const items = data.loggedAppliances || [];

        setLoggedAppliances(items);
        setRatePerKwh(Number(data.ratePerKwh || 0.22));

        const calculatedSum = items.reduce(
          (acc, cur) => acc + (Number(cur.kwh) || 0),
          0
        );

        setTotalKwh(
          data.totalKwh !== undefined
            ? Number(data.totalKwh)
            : calculatedSum
        );
      } else {
        const initialItems = [
          {
            id: '1',
            name: 'Refrigerator',
            watts: 150,
            hours: 24,
            kwh: 3.6,
            cost: 0.79,
          },
          {
            id: '2',
            name: 'Microwave',
            watts: 1200,
            hours: 0.5,
            kwh: 0.6,
            cost: 0.13,
          },
          {
            id: '3',
            name: 'Air Conditioner',
            watts: 1800,
            hours: 4.0,
            kwh: 7.2,
            cost: 1.58,
          },
        ];

        const sum = initialItems.reduce((acc, cur) => acc + cur.kwh, 0);

        setLoggedAppliances(initialItems);
        setTotalKwh(sum);

        await setDoc(
          docRef,
          {
            ratePerKwh: 0.22,
            totalKwh: sum,
            loggedAppliances: initialItems,
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error('Error loading electricity dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchElectricData();
    }, [userID])
  );

  const sortedAppliances = [...loggedAppliances].sort(
    (a, b) => (b.kwh || 0) - (a.kwh || 0)
  );

  const peakAppliance = sortedAppliances[0] || {
    name: 'None',
    kwh: 0,
  };

  const estimatedTotalCost = (totalKwh * ratePerKwh).toFixed(2);

  const generateSuggestions = () => {
    if (loggedAppliances.length === 0) {
      return [
        'Add appliances to start tracking energy use.',
        'Enter daily usage to estimate your electricity cost.',
      ];
    }

    const tips = [];

    if (peakAppliance.kwh > 3) {
      tips.push(
        `${peakAppliance.name} is your highest-use device at ${peakAppliance.kwh} kWh.`
      );
    }

    tips.push('Try running high-power appliances during off-peak hours.');

    if (loggedAppliances.length > 2) {
      tips.push(`${loggedAppliances.length} devices are currently being tracked.`);
    }

    return tips.slice(0, 3);
  };

  const suggestions = generateSuggestions();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Loading electricity dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      
        <View style={styles.headerRow}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.eyebrow}>HOME ENERGY</Text>
            <Text style={styles.headerTitle}>Electricity Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              Monitor usage, cost, and your most active devices.
            </Text>
          </View>

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        </View>

       
        <Card style={styles.summaryCard}>
          <Card.Content style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>Current usage</Text>

            <View style={styles.usageLine}>
              <Text style={styles.usageValue}>{totalKwh.toFixed(1)}</Text>
              <Text style={styles.usageUnit}>kWh</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryStatsRow}>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatLabel}>Estimated cost</Text>
                <Text style={styles.summaryStatValue}>
                  ${estimatedTotalCost}
                </Text>
              </View>

              <View style={styles.verticalDivider} />

              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatLabel}>Devices</Text>
                <Text style={styles.summaryStatValue}>
                  {loggedAppliances.length}
                </Text>
              </View>

              <View style={styles.verticalDivider} />

              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatLabel}>Rate</Text>
                <Text style={styles.summaryStatValue}>
                  ${ratePerKwh}
                </Text>
                <Text style={styles.summaryStatSuffix}>per kWh</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

      
        <View style={styles.actionButtonsRow}>
          <Button
            mode="contained"
            buttonColor="#0F766E"
            textColor="#FFFFFF"
            icon="history"
            contentStyle={styles.actionButtonContent}
            labelStyle={styles.actionButtonLabel}
            style={styles.actionButton}
            onPress={() => navigation.navigate('Electric History')}
          >
            History
          </Button>

         
          <Button
            mode="contained"
            buttonColor="#2563EB"
            textColor="#FFFFFF"
            icon="snowflake"
            contentStyle={styles.actionButtonContent}
            labelStyle={styles.actionButtonLabel}
            style={styles.actionButton}
            onPress={() => navigation.navigate('Air Conditioner')}
          >
            AC Optimizer
          </Button>

          <Button
            mode="contained"
            buttonColor="#F97316"
            textColor="#FFFFFF"
            icon="plus-circle-outline"
            contentStyle={styles.actionButtonContent}
            labelStyle={styles.actionButtonLabel}
            style={styles.actionButton}
            onPress={() => navigation.navigate('Electric Screen')}
          >
            Add Item
          </Button>
        </View>

       
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionTitleRow}>
              <View>
                <Text style={styles.sectionTitle}>Smart suggestions</Text>
                <Text style={styles.sectionSubtitle}>
                  Simple ways to manage your electricity use.
                </Text>
              </View>

              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI</Text>
              </View>
            </View>

            <View style={styles.suggestionList}>
              {suggestions.map((item, index) => (
                <View key={index} style={styles.suggestionRow}>
                  <View style={styles.suggestionNumber}>
                    <Text style={styles.suggestionNumberText}>
                      {index + 1}
                    </Text>
                  </View>

                  <Text style={styles.suggestionText}>{item}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

       
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionTitleRow}>
              <View>
                <Text style={styles.sectionTitle}>Top devices</Text>
                <Text style={styles.sectionSubtitle}>
                  Ranked by energy consumption. Tap AC to optimize.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('Electric Screen')}
                activeOpacity={0.75}
              >
                <Text style={styles.editButtonText}>Add / Edit</Text>
              </TouchableOpacity>
            </View>

            {sortedAppliances.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>
                  No appliances logged yet
                </Text>

                <Text style={styles.emptyText}>
                  Add a device to begin tracking electricity use.
                </Text>
              </View>
            ) : (
              sortedAppliances.slice(0, 4).map((item, index) => {
                const isAcItem =
                  (item.name || '').toLowerCase().includes('air conditioner') ||
                  (item.name || '').toLowerCase().includes('ac');

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (isAcItem) {
                        navigation.navigate('Air Conditioner');
                      } else {
                        navigation.navigate('Electric Screen');
                      }
                    }}
                    style={[
                      styles.deviceRow,
                      index === Math.min(sortedAppliances.length, 4) - 1 &&
                        styles.deviceRowLast,
                    ]}
                  >
                    <View style={styles.deviceLeft}>
                      <View
                        style={[
                          styles.rankBadge,
                          index === 0 && styles.rankBadgePrimary,
                          isAcItem && styles.rankBadgeAc,
                        ]}
                      >
                        <Text
                          style={[
                            styles.rankText,
                            index === 0 && styles.rankTextPrimary,
                            isAcItem && styles.rankTextAc,
                          ]}
                        >
                          {isAcItem ? '❄' : index + 1}
                        </Text>
                      </View>

                      <View style={styles.deviceTextBlock}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text
                            style={styles.deviceName}
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>
                          {isAcItem && (
                            <Text style={styles.acTagText}>Tap to Optimize →</Text>
                          )}
                        </View>

                        <Text style={styles.deviceMeta}>
                          {item.watts
                            ? `${item.watts} W`
                            : item.powerKw
                            ? `${item.powerKw} kW`
                            : 'Power not set'}

                          {item.hours
                            ? `  •  ${item.hours} hr`
                            : item.durationHours
                            ? `  •  ${item.durationHours} hr`
                            : ''}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.deviceValueBlock}>
                      <Text style={styles.deviceKwh}>
                        {item.kwh} kWh
                      </Text>

                      <Text style={styles.deviceCost}>
                        ~$
                        {(
                          Number(item.kwh || 0) * ratePerKwh
                        ).toFixed(2)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </Card.Content>
        </Card>

       
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionTitleRow}>
              <View>
                <Text style={styles.sectionTitle}>Recent bills</Text>
                <Text style={styles.sectionSubtitle}>
                  Your last three bill totals.
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate('Electric History')}
                activeOpacity={0.75}
              >
                <Text style={styles.linkText}>View history</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.billList}>
              {billHistory.map((item, index) => (
                <View
                  key={item.month}
                  style={[
                    styles.billRow,
                    index === billHistory.length - 1 &&
                      styles.billRowLast,
                  ]}
                >
                  <View>
                    <Text style={styles.billMonth}>
                      {item.month}
                    </Text>

                    <Text style={styles.billCaption}>
                      Electric bill
                    </Text>
                  </View>

                  <Text style={styles.billAmount}>
                    ${item.amount.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

       
        <Button
          mode="outlined"
          textColor="#F97316"
          icon="calculator-variant-outline"
          contentStyle={styles.bottomButtonContent}
          labelStyle={styles.bottomButtonLabel}
          style={styles.bottomOutlineButton}
          onPress={() => navigation.navigate('Electric Screen')}
        >
          Calculate & Log Appliance Usage
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ElectricMainScreen;

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
    color: '#64748B',
    fontSize: 13,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 2,
  },
  headerTextBlock: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F97316',
    letterSpacing: 1.3,
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.6,
  },
  headerSubtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#64748B',
    marginTop: 5,
    maxWidth: 290,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#ECFDF5',
    marginTop: 2,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#047857',
  },
  summaryCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    elevation: 4,
  },
  summaryContent: {
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#CBD5E1',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  usageLine: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 3,
  },
  usageValue: {
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1.2,
  },
  usageUnit: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
    marginLeft: 7,
    marginBottom: 6,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 15,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  summaryStat: {
    flex: 1,
  },
  summaryStatLabel: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginBottom: 4,
  },
  summaryStatValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryStatSuffix: {
    fontSize: 8.5,
    color: '#64748B',
    marginTop: 1,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#334155',
    marginHorizontal: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
  },
  actionButtonContent: {
    minHeight: 44,
  },
  actionButtonLabel: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },
  cardContent: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  aiBadge: {
    minWidth: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  suggestionList: {
    marginTop: 13,
    gap: 9,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  suggestionNumber: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionNumberText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F97316',
  },
  suggestionText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: '#475569',
  },
  editButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: '#FFF7ED',
  },
  editButtonText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#EA580C',
  },
  deviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  deviceRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  deviceLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  rankBadge: {
    width: 29,
    height: 29,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankBadgePrimary: {
    backgroundColor: '#FFF7ED',
  },
  rankBadgeAc: {
    backgroundColor: '#EFF6FF',
  },
  rankText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
  },
  rankTextPrimary: {
    color: '#EA580C',
  },
  rankTextAc: {
    color: '#2563EB',
    fontSize: 13,
  },
  deviceTextBlock: {
    flex: 1,
  },
  deviceName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  acTagText: {
    fontSize: 9.5,
    color: '#2563EB',
    fontWeight: '700',
  },
  deviceMeta: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  deviceValueBlock: {
    alignItems: 'flex-end',
  },
  deviceKwh: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  deviceCost: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  emptyText: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  linkText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0F766E',
  },
  billList: {
    marginTop: 10,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  billRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  billMonth: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
  },
  billCaption: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  billAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  bottomOutlineButton: {
    borderColor: '#FDBA74',
    borderWidth: 1.5,
    borderRadius: 12,
    marginTop: 2,
  },
  bottomButtonContent: {
    minHeight: 46,
  },
  bottomButtonLabel: {
    fontSize: 11.5,
    fontWeight: '700',
  },
});
