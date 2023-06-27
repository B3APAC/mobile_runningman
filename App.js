import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity,FlatList } from 'react-native';
import MapView, { Marker }  from 'react-native-maps';
import * as Location from 'expo-location';
import geolib from 'geolib';


const App = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);

  const calculateDistance = (startCoords, endCoords) => {
    const earthRadius = 6371; // Rayon de la Terre en kilomètres
  
    const { latitude: startLat, longitude: startLng } = startCoords;
    const { latitude: endLat, longitude: endLng } = endCoords;
  
    const latDiff = (endLat - startLat) * (Math.PI / 180);
    const lngDiff = (endLng - startLng) * (Math.PI / 180);
  
    const a =
      Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
      Math.cos(startLat * (Math.PI / 180)) *
        Math.cos(endLat * (Math.PI / 180)) *
        Math.sin(lngDiff / 2) *
        Math.sin(lngDiff / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c;
  
    return distance;
  };

  const handleRecordButtonPress = () => {
    if (isRecording) {
      // Arrêter l'enregistrement
      // ...
  
      const startLocation = recordings.length > 0 ? recordings[0].location : null;
      const endLocation = location ? location.coords : null;
      let distance = 0;
      if (startLocation && endLocation) {
        distance = calculateDistance(
          {
            latitude: startLocation.latitude,
            longitude: startLocation.longitude,
          },
          {
            latitude: endLocation.latitude,
            longitude: endLocation.longitude,
          }
        );
      }
  
      const recordingData = {
        distance: distance,
        startDate: recordings.length > 0 ? recordings[0].startDate : null,
        endDate: new Date().toLocaleString(),
      };
  
      setRecordings([...recordings, recordingData]);
    } else {
      // Commencer l'enregistrement
      // ...
  
      setRecordings([{ location: location.coords, startDate: new Date().toLocaleString() }]);
    }
  
    setIsRecording(!isRecording);
  };
  
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <Text>{errorMsg}</Text>
      ) : location ? (
        <View style={styles.contentContainer}>
          <View style={styles.recordingsContainer}>
            <FlatList
              data={recordings}
              renderItem={({ item }) => (
                <View style={styles.recordingItem}>
                  {/* Afficher les informations de l'enregistrement */}
                  <Text style={styles.recordingText}>{item.distance}</Text>
                  <Text style={styles.recordingText}>{item.startDate}</Text>
                  <Text style={styles.recordingText}>{item.endDate}</Text>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title="My Location"
              />
            </MapView>
            <TouchableOpacity
                style={[styles.button, isRecording ? styles.buttonRecording : null]}
                onPress={handleRecordButtonPress}
              >
                <Text style={styles.buttonText}>
                  {isRecording ? 'end' : 'start'}
                </Text>
            </TouchableOpacity>
          </View>
          
        </View>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    marginTop: 10,
    flexDirection: 'row',
  },
  recordingsContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  recordingItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'white',
  },
  recordingText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
  button: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 25,
  },
  buttonRecording: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
