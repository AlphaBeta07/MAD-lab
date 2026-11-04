import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface CustomHeaderProps {
  title: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ title, leftIcon, rightIcon, style, titleStyle }) => {
  return (
    <View style={[styles.header, style]}>
      {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343A40',
    textAlign: 'center',
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    position: 'absolute',
    left: 16,
  },
});

export default CustomHeader;
