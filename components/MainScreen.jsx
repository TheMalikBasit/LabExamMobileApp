import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QuranApp = () => {
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSurah, setExpandedSurah] = useState(null); // To track which surah is expanded
  const [ayahs, setAyahs] = useState({}); // To store Ayahs for each surah

  useEffect(() => {
    loadSurahData();
  }, []);

  const loadSurahData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('surahData');
      if (storedData) {
        setSurahs(JSON.parse(storedData));
        setLoading(false);
      } else {
        fetchSurahData();
      }
    } catch (error) {
      console.error('Error loading surah data:', error);
      Alert.alert('Error', 'Failed to load data.');
      setLoading(false);
    }
  };

  const fetchSurahData = async () => {
    try {
      const response = await fetch('https://api.alquran.cloud/v1/quran/en.asad');
      const result = await response.json();
      setSurahs(result.data.surahs);
      await AsyncStorage.setItem('surahData', JSON.stringify(result.data.surahs));
    } catch (error) {
      console.error('Error fetching data from API:', error);
      Alert.alert('Network Error', 'Unable to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAyahs = async (surahNumber) => {
    if (!ayahs[surahNumber]) {
      try {
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.asad`);
        const result = await response.json();
        setAyahs((prevAyahs) => ({ ...prevAyahs, [surahNumber]: result.data.ayahs }));
      } catch (error) {
        console.error('Error fetching Ayahs:', error);
        Alert.alert('Error', 'Failed to load Ayahs.');
      }
    }
  };

  const toggleSurah = (surahNumber) => {
    if (expandedSurah === surahNumber) {
      setExpandedSurah(null); // Collapse if already expanded
    } else {
      setExpandedSurah(surahNumber); // Expand the clicked surah
      fetchAyahs(surahNumber); // Fetch Ayahs for the clicked surah
    }
  };

  const renderAyahs = (surahNumber) => {
    if (!ayahs[surahNumber]) return null;
    return ayahs[surahNumber].map((ayah) => (
      <Text key={ayah.numberInSurah} style={styles.ayahText}>
        {ayah.numberInSurah}. {ayah.text}
      </Text>
    ));
  };

  const renderSurah = ({ item }) => {
    const isExpanded = expandedSurah === item.number;

    return (
      <TouchableOpacity onPress={() => toggleSurah(item.number)}>
        <View style={styles.surahContainer}>
          <View style={styles.iconContainer}>
            <Image
              source={{ uri: 'https://img.icons8.com/doodle/48/quran.png' }}
              style={styles.icon}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.surahName}>{item.englishName}</Text>
            <Text style={styles.surahDetails}>
              {item.revelationType} • {item.ayahs.length} verses
            </Text>
          </View>
          <Text style={styles.surahArabicName}>{item.name}</Text>
        </View>
        {isExpanded && (
          <View style={styles.ayahContainer}>
            <Text style={styles.ayahHeader}>Ayahs:</Text>
            {renderAyahs(item.number)}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" />
      ) : (
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.greeting}>Assalamualaikum</Text>
            <Text style={styles.username}>Malik Abdul Basit</Text>
            <View style={styles.lastReadContainer}>
              <Text style={styles.lastReadTitle}>Last Read</Text>
              <Text style={styles.lastReadSurah}>Al-Fatiha</Text>
              <Text style={styles.ayahNo}>Ayah No: 1</Text>
              <Image
                source={{ uri: 'https://img.icons8.com/doodle/64/quran-book.png' }}
                style={styles.quranIcon}
              />
            </View>
          </View>
          <FlatList
            data={surahs}
            renderItem={renderSurah}
            keyExtractor={(item) => item.number.toString()}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    padding: 20,
    backgroundColor: '#6200ee',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 18,
    color: '#FFF',
  },
  username: {
    fontSize: 22,
    color: '#FFF',
    fontWeight: 'bold',
    marginVertical: 5,
  },
  lastReadContainer: {
    backgroundColor: '#B39DDB',
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastReadTitle: {
    fontSize: 14,
    color: '#FFF',
  },
  lastReadSurah: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
  ayahNo: {
    fontSize: 12,
    color: '#FFF',
  },
  quranIcon: {
    width: 50,
    height: 50,
    marginLeft: 'auto',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  surahContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 15,
  },
  icon: {
    width: 30,
    height: 30,
  },
  textContainer: {
    flex: 1,
  },
  surahName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  surahDetails: {
    fontSize: 14,
    color: '#7E7E7E',
  },
  surahArabicName: {
    fontSize: 18,
    color: '#6200ee',
  },
  ayahContainer: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  ayahHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  ayahText: {
    fontSize: 14,
    marginBottom: 3,
    color: '#333',
  },
});

export default QuranApp;
