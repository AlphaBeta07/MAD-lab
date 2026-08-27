import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const App = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.text}>Header (flex: 1)</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.box1}>
          <Text style={styles.text}>Box 1 (flex: 1)</Text>
        </View>
        <View style={styles.box2}>
          <Text style={styles.text}>Box 2 (flex: 2)</Text>
        </View>
        <View style={styles.box3}>
          <Text style={styles.text}>Box 3 (flex: 1)</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.text}>Footer (flex: 1)</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column', // default is column
  },
  header: {
    flex: 1,
    backgroundColor: '#ff7f50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 4,
    flexDirection: 'row', // align children in a row
  },
  box1: {
    flex: 1,
    backgroundColor: '#87ceeb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box2: {
    flex: 2,
    backgroundColor: '#3cb371',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box3: {
    flex: 1,
    backgroundColor: '#9370db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flex: 1,
    backgroundColor: '#f08080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default App;
