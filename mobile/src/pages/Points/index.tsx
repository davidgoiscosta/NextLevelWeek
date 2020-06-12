import React, {useState, useEffect} from 'react'
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert} from 'react-native'
import { Feather as Icon} from '@expo/vector-icons'
import Constants from 'expo-constants'
import {useNavigation, useRoute} from '@react-navigation/native'
import MapView, {Marker} from 'react-native-maps'
import {SvgUri} from 'react-native-svg'
import api from '../../services/api'
import * as Location from 'expo-location'


interface Item {
  id: number,
  image_url: string,
  title: string
}

interface Point {
  id: number,
  image: string,
  image_url: string,
  name: string,
  latitude: number,
  longitude: number,
}

interface RouteParams {
  city: string,
  uf: string
}

const Points = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const routeParams = route.params as RouteParams;

  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [initPosition, setInitPosition] = useState<[number, number]>([0, 0])
  const [points, setPoints] = useState<Point[]>([])

  useEffect(() => {
    async function loadPosition(){
      const { status } = await Location.requestPermissionsAsync();

      if (status !== 'granted'){
        Alert.alert('Oops', 'Não foi possível achar sua localização. Conceda permissão em Configurações e tente novamente')
      }

      const location = await Location.getCurrentPositionAsync();

      const {latitude, longitude} = location.coords;
      setInitPosition([latitude, longitude]);
    }
    loadPosition();
  }, [])

  useEffect(() => {
    api.get('items').then(res => {
      setItems(res.data);
    })
  },[])

  useEffect(()=>{
    getPoints();
  }, [selectedItems])

  function getPoints(){
    api.get('points', {
      params: {
        city: routeParams.city,
        uf: routeParams.uf,
        items: selectedItems.length === 0 ? [1,2,3,4,5,6] : selectedItems 
    }}).then(res => {
      setPoints(res.data)
    })
  }

  function handleNavigateBack(){
    navigation.goBack()
  }

  function handleNavigateToDetail(id: number){
    navigation.navigate('Detail', { point_id: id })
  }

  function handleItemPress(id: number){
    if(selectedItems.indexOf(id) >= 0){
      const updatedSelected = selectedItems.filter(item => item !== id)
      setSelectedItems(updatedSelected)
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  return (
    <>
    <View style={styles.container}>
      <TouchableOpacity onPress={handleNavigateBack}>
        <Icon name="arrow-left" size={20} color="#34CD79"/>
      </TouchableOpacity>

      <Text style={styles.title}>Bem-vindo!</Text>
      <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

      <View style={styles.mapContainer}>
        {initPosition[0] !== 0 && (
          <MapView
            style={styles.map}
            loadingEnabled={initPosition[0] === 0}
            initialRegion={{
              latitude: initPosition[0],
              longitude: initPosition[1],
              latitudeDelta: 0.014,
              longitudeDelta: 0.014
          }}>
            {points.map((item: Point) => (
              <Marker
                style={styles.mapMarker}
                coordinate={{
                  latitude: item.latitude,
                  longitude: item.longitude,
                }}
                onPress={() => handleNavigateToDetail(item.id)}
                key={item.id}
              >
                <View style={styles.mapMarkerContainer}>
                  <Image 
                    style={styles.mapMarkerImage}
                    source={{uri: item.image_url}}
                  />
                  <Text style={styles.mapMarkerTitle}>{item.name}</Text>
                </View>
              </Marker>
            ))}
          </MapView>
        )}
      </View>
    </View>
    <View style={styles.itemsContainer}>
      <ScrollView horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: 32}}
      >
        {items.map((item: Item) => (
          <TouchableOpacity 
            style={selectedItems.includes(item.id) ? styles.selectedItem : styles.item} 
            onPress={() => handleItemPress(item.id)}
            activeOpacity={0.6}
            key={String(item.id)}
          >
            <SvgUri width={42} height={42} uri={item.image_url}/>
            <Text style={styles.itemTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 80, 
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: '#34CB79',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center'
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 13,
    lineHeight: 23,
  },

  itemsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center',
  },

  selectedItem: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#34CB79',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center'
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
});

export default Points