import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';

const ElectricMainScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Electricity Dashboard</Text>
          <Text style={styles.headerSubtitle}>Real-time Monitoring & Insights</Text>
        </View>

        {/* 1. Today's Usage Section */}
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.cardTouch}
          onPress={() => navigation.navigate('Storage Detail', { title: "Today's Usage Breakdown" })}
        >
          <Card style={styles.mainCard}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Today’s Usage</Text>
                <Text style={styles.badgeText}>Live Update</Text>
              </View>
              
              {/* Dynamic SVG Line Chart with Grid Lines */}
              <View style={styles.chartContainer}>
                <Svg height="100%" width="100%" viewBox="0 0 200 80">
                  {/* Background Grid Lines */}
                  <Line x1="0" y1="20" x2="200" y2="20" stroke="#f0f0f0" strokeWidth="1" />
                  <Line x1="0" y1="50" x2="200" y2="50" stroke="#f0f0f0" strokeWidth="1" />
                  
                  {/* Data Polyline */}
                  <Polyline
                    points="10,60 50,45 90,20 130,70 180,10"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Data Node Accent Points */}
                  <Circle cx="90" cy="20" r="4" fill="#10B981" />
                  <Circle cx="180" cy="10" r="4" fill="#10B981" />
                </Svg>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>

        {/* 2. Middle Section (2 Columns) */}
        <View style={styles.rowTwo}>
          {/* AI Suggestions Card */}
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={[styles.cardTouch, { flex: 1 }]}
            onPress={() => navigation.navigate('Recipe List')}
          >
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Text style={styles.sectionHeader}>AI’s Suggestions</Text>
                <View style={styles.listContainer}>
                  <Text style={styles.bulletItem}>• Turn off Bedroom Lights</Text>
                  <Text style={styles.bulletItem}>• Run Dishwasher after 9 PM</Text>
                  <Text style={styles.bulletItem}>• AC active for 6 hrs</Text>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>

          {/* Rooms Card */}
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={[styles.cardTouch, { flex: 1.1 }]}
            onPress={() => navigation.navigate('Storage List')}
          >
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <Text style={styles.sectionHeader}>Room Consumption</Text>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Kitchen</Text>
                  <Text style={styles.dataValue}>5.7 kWh</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Living Room</Text>
                  <Text style={styles.dataValue}>4.9 kWh</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Bedroom</Text>
                  <Text style={styles.dataValue}>3.8 kWh</Text>
                </View>
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Bathroom</Text>
                  <Text style={styles.dataValue}>1.4 kWh</Text>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        </View>

        {/* 3. Bottom Section (3 Columns) */}
        <View style={styles.rowThree}>
          {/* Highest Energy Device */}
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={[styles.cardTouch, { flex: 1 }]}
            onPress={() => navigation.navigate('Food List')}
          >
            <Card style={styles.card}>
              <Card.Content style={styles.cardContentCompact}>
                <Text style={styles.miniHeader}>Peak Device</Text>
                <Text style={styles.highlightText}>Air Conditioner</Text>
                <Text style={styles.subDetailText}>7.8 kWh</Text>
                <Text style={styles.minorText}>Refrigerator: 4.3 kWh</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>

          {/* Monthly Summary */}
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={[styles.cardTouch, { flex: 1 }]}
            onPress={() => navigation.navigate('Meal Planner')}
          >
            <Card style={styles.card}>
              <Card.Content style={styles.cardContentCompact}>
                <Text style={styles.miniHeader}>This Month</Text>
                <Text style={styles.metricBig}>421 kWh</Text>
                <View style={styles.divider} />
                <Text style={styles.minorLabel}>Est. Bill</Text>
                <Text style={styles.highlightText}>$108.32</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>

          {/* Electric Bills */}
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={[styles.cardTouch, { flex: 1 }]}
            onPress={() => navigation.navigate('Meal Planner Detail')}
          >
            <Card style={styles.card}>
              <Card.Content style={styles.cardContentCompact}>
                <Text style={styles.miniHeader}>Bill History</Text>
                <View style={styles.historyRow}>
                  <Text style={styles.historyMonth}>Aug</Text>
                  <Text style={styles.historyPrice}>$108.32</Text>
                </View>
                <View style={styles.historyRow}>
                  <Text style={styles.historyMonth}>Jul</Text>
                  <Text style={styles.historyPrice}>$102.14</Text>
                </View>
                <View style={styles.historyRow}>
                  <Text style={styles.historyMonth}>Jun</Text>
                  <Text style={styles.historyPrice}>$115.08</Text>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        </View>

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
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  headerContainer: {
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  cardTouch: {
    width: '100%',
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: '100%',
  },
  cardContent: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  cardContentCompact: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  miniHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  listContainer: {
    gap: 4,
  },
  bulletItem: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2.5,
  },
  dataLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  dataValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
  },
  metricBig: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginVertical: 2,
  },
  highlightText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    textAlign: 'center',
  },
  subDetailText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  minorText: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'center',
  },
  minorLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    width: '100%',
    marginVertical: 4,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 2,
  },
  historyMonth: {
    fontSize: 11,
    color: '#64748B',
  },
  historyPrice: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  chartContainer: {
    width: '100%',
    height: 90,
    marginTop: 4,
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 10,
  },
  rowThree: {
    flexDirection: 'row',
    gap: 8,
  },
});
