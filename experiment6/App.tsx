import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import CustomHeader from './components/CustomHeader';
import CustomCard from './components/CustomCard';
import CustomInput from './components/CustomInput';
import CustomButton from './components/CustomButton';

const HomeScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.welcomeText}>Hello Jii</Text>
    <Text style={styles.subText}>Welcome to the Home Screen</Text>
  </View>
);

const ProfileScreen = ({ name, setName }: { name: string, setName: (val: string) => void }) => (
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
            source={{ uri: 'https://www.w3schools.com/howto/img_avatar.png' }}
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
);

const App = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [name, setName] = useState('Anish Landage');

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen />;
      case 'Profile':
        return <ProfileScreen name={name} setName={setName} />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title={activeTab === 'Home' ? "Home" : "My Student App"}
        style={styles.header}
        titleStyle={styles.headerTitle}
      />

      <View style={styles.content}>
        {renderScreen()}
      </View>

      {/* Simple Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navButton, activeTab === 'Home' && styles.activeNavButton]}
          onPress={() => setActiveTab('Home')}
        >
          <Text style={[styles.navButtonText, activeTab === 'Home' && styles.activeNavButtonText]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navButton, activeTab === 'Profile' && styles.activeNavButton]}
          onPress={() => setActiveTab('Profile')}
        >
          <Text style={[styles.navButtonText, activeTab === 'Profile' && styles.activeNavButtonText]}>Profile</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#800080',
    marginBottom: 10,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
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
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  activeNavButton: {
    backgroundColor: '#800080',
  },
  navButtonText: {
    fontSize: 16,
    color: '#800080',
    fontWeight: 'bold',
  },
  activeNavButtonText: {
    color: '#FFFFFF',
  },
});

export default App;
