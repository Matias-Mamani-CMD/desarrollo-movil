import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Image,
  ImageBackground, //imágen de fondo
  ScrollView, // pantalla desplazable
  KeyboardAvoidingView,
  Platform //adaptar según sistema operativo
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';

export default function Home({ navigation }) {

  const handleLogOut = async () => {
    try {
      await signOut(auth);  
      Alert.alert("Sesión cerrada", "Has cerrado sesión correctamente.");
      navigation.replace('Login');  
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al cerrar sesión.");
    }
  };

  return (
    <ImageBackground
      source={require('../assets/background.jpg')}

      style={styles.background}
      imageStyle = {{opacity: 0.9}} //opacidad
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, width: '100%' }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >

          <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={handleLogOut}>
              <Text style={styles.buttonText}>Cerrar sesión </Text>
              <Image 
                  source={require('../assets/icon-exit.png')}
                  style={styles.exitImage}
              />
            </TouchableOpacity>

            <View style={styles.box}>
              <Text style={styles.title}>Bienvenido, Nombre Tutor!</Text>
              <Text style={styles.baseText}>
                Este espacio le permitirá seguir de cerca el progreso escolar de su hijo y mantenerse en contacto con la institución.
              </Text>
            </View>
            <View style={styles.grayBackground}>
              <View style={styles.boxAlumn}>
                <View style={styles.circleBackground}>
                  <Image 
                    source={require('../assets/m-icon.png')}
                    style={styles.alumnImage}
                  />
                  </View>
                  <Text style={styles.textAlumnName}>Nombre Alumno</Text>
                  <Text style={styles.textYear}>1º AÑO</Text>
                
              </View>
              <View style={styles.boxAlumn}>
                <View style={styles.circleBackground}>
                  <Image 
                    source={require('../assets/f-icon.png')}
                    style={styles.alumnImage}
                  />
                  </View>
                  <Text style={styles.textAlumnName}>Nombre Alumno</Text>
                  <Text style={styles.textYear}>2º AÑO</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  }, //mostrar fondo
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12, //espacio entre el cuadro de Bienvenida y el fondo
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  box: {
    backgroundColor: '#db2024ff', //color caja de texto de Bienvenida 
    borderRadius: 15, //bordes redondeados
    padding: 15, //espacio entre el texto y la caja
    paddingBottom: 27, //espacio inferior
    borderColor: '#000000ff', //color de borde de la caja de Bienvenida
    borderWidth: 1, //ancho del borde de la caja
    marginBottom: 30, //separación inferior con la sección de Alumnos
  },
  title: {
    color: '#fff', //color de fuente en el título de Bienvenida
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center', //centrar texto principal de Bienvenida a Tutor
  },
  baseText:{
    color: '#fff',
    fontSize: 18,
    fontWeight: 'regular',
    marginBottom: 15,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#031666ff', // color del botón
    paddingVertical: 8, 
    paddingHorizontal: 15,
    borderRadius: 5, //bordes redondeados
    marginTop: 2, 
    marginBottom: 6,
    alignSelf: 'flex-end'
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  boxAlumn: {
    margin: 20,
    marginBottom: '40',
    backgroundColor: '#031666ff', //color de caja para seleccionar Alumno
    borderRadius: 15, //bordes redondeados
    padding: 20, //espaciado entre el texto y la caja
    width: 385,
    alignItems: 'center', //centra horizontalmente
    justifyContent: 'center', //centra verticalmente
  },
  textAlumnName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  }, // nombre del alumno
  textYear: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'regular',
    textAlign: 'center',
  }, //año que cursa el alumno
  circleBackground: {
    backgroundColor: '#fff',
    width: 105,
    height: 105,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  }, //fondo circular del ícono del alumno
  alumnImage: {
    marginHorizontal: 5,
    width: 92,
    height: 92,
    marginBottom: 8,
  }, //íconos de alumnos
  exitImage: {
    paddingRight: 10,
    width: 20,
    height: 20,
  }, //ícono de cerrar sesión
  grayBackground: {
    backgroundColor: '#bbbbbbb6',
    paddingTop: 40,
    paddingBottom: 30,
  }, // parte del fondo gris

});

