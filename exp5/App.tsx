import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import CustomHeader from './components/CustomHeader';
import CustomCard from './components/CustomCard';
import CustomInput from './components/CustomInput';
import CustomButton from './components/CustomButton';

const App = () => {
  const [name, setName] = useState('Anish Landage');

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title="My Student App"
        style={styles.header}
        titleStyle={styles.headerTitle}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomInput
          label="Enter Your Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          labelStyle={styles.inputLabel}
        />

        <CustomCard style={styles.card}>
          <View style={styles.avatarOuter}>
            <View style={styles.avatarInner}>
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
                style={styles.avatar}
              />
            </View>
          </View>
          <Text style={styles.cardName}>{name || 'Student Name'}</Text>
          <Text style={styles.cardText}>College: DKTE College</Text>
          <Text style={styles.cardText}>Branch: CSE AIML</Text>
          <Text style={styles.cardText}>ID: 101</Text>
        </CustomCard>

        <CustomButton
          title="Click Me"
          onPress={() => { }}
          style={styles.button}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8DA', // Pale yellow background matching screenshot
  },
  header: {
    backgroundColor: '#800080', // Purple header
    borderBottomWidth: 0,
    paddingVertical: 18,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
  },
  scrollContent: {
    padding: 20,
  },
  inputLabel: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FAF8DA',
    borderColor: '#800080', // Dark purple/black border
    borderWidth: 1,
    color: '#000000',
    borderRadius: 8,
  },
  card: {
    backgroundColor: '#EAE6FF', // Light lavender card background
    alignItems: 'center',
    paddingVertical: 30,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 24,
    elevation: 0, // Remove heavy shadow to match flat design
    shadowOpacity: 0,
  },
  avatarOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#EBD1DC', // Peach ring around avatar
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: 90,
    height: 90,
    resizeMode: 'cover',
  },
  cardName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#800080', // Purple button
    borderRadius: 8,
    paddingVertical: 14,
  },
});

export default App;
