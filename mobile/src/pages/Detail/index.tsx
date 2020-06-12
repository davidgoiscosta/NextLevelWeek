import React, { useEffect, useState} from 'react'
import {View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Linking, Platform} from 'react-native'
import MapView, {Marker} from 'react-native-maps'
import { Feather as Icon, FontAwesome } from '@expo/vector-icons'
import { useNavigation, useRoute} from '@react-navigation/native'
import {RectButton} from 'react-native-gesture-handler'
import api from '../../services/api'
import * as MailComposer from 'expo-mail-composer';

interface RouteParams {
    point_id: number
}

interface Data{
  point: {
    id: number,
    image: string,
    image_url: string,
    name: string,
    email: string,
    whatsapp: string,
    city: string,
    uf: string,
    latitude: number,
    longitude: number
  },
  items: {
    title: string
  }[],
}

const Detail = () => {
  const route = useRoute();
  const routeParams = route.params as RouteParams;
  const navigation = useNavigation();

  const [data, setData] = useState<Data>({} as Data)

  useEffect(()=> {
    api.get(`points/${routeParams.point_id}`).then(res => {
      setData(res.data);
    })
  }, [])

  function handleNavigateBack(){
    navigation.goBack();
  }

  function handleComposeMail(){
    const mail = {
      recipients: [data.point.email],
      subject: "Ponto de coleta",
    }
    MailComposer.composeAsync(mail);
  }

  function handleComposeMessage(){
    Linking.openURL(`whatsapp://send?phone=${data.point.whatsapp}`)
  }

  function handleOpenMap(){
    if(Platform.OS === 'ios'){
      Linking.openURL(`http://maps.apple.com/?daddr=${data.point.latitude},${data.point.longitude}`)
    } else {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${data.point.latitude},${data.point.longitude}`)
    }
  }

  if (!data.point){
    return null
  }

  return (
    <SafeAreaView style={{flex: 1}}>
    <View style={styles.container}>
      <TouchableOpacity onPress={handleNavigateBack}>
        <Icon name="arrow-left" size={20} color="#34CD79"/>
      </TouchableOpacity>

      <Image source={{uri: data.point.image_url}}
        style={styles.pointImage}
      />
      <Text style={styles.pointName}>{data.point.name}</Text>
      <Text style={styles.pointItems}>{data.items.map(item => item.title).join(', ')}</Text>
      <View style={styles.mapContainer}>
        {data.point.latitude !== undefined && (
          <MapView
            onPress={handleOpenMap}
            style={styles.map}
            initialRegion={{
              latitude: data.point.latitude,
              longitude: data.point.longitude,
              latitudeDelta: 0.014,
              longitudeDelta: 0.014
          }}
          >
            <Marker
              pinColor='#34CB79'
              onPress={handleOpenMap}
              coordinate={{
                latitude: data.point.latitude,
                longitude: data.point.longitude,
              }}
            />
          </MapView>
        )}
      </View>
    </View>
    <View style={styles.footer}>
        <RectButton style={styles.button} onPress={handleComposeMessage}>
          <FontAwesome name="whatsapp" size={20} color='#fff'/>
          <Text style={styles.buttonText}>WhatsApp</Text>
        </RectButton>
        <RectButton style={styles.button} onPress={handleComposeMail}>
          <Icon name="mail" size={20} color='#fff'/>
          <Text style={styles.buttonText}>E-mail</Text>
        </RectButton>
    </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    paddingTop: 20,
  },

  pointImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    borderRadius: 10,
    marginTop: 32,
  },

  pointName: {
    color: '#322153',
    fontSize: 28,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  pointItems: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    color: '#6C6C80'
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

  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  
  button: {
    width: '48%',
    backgroundColor: '#34CB79',
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    marginLeft: 8,
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Roboto_500Medium',
  },
});

export default Detail;