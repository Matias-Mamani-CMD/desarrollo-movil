import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Image,
  Dimensions,
  ImageBackground, //imágen de fondo
  ScrollView, // pantalla desplazable
  Modal,
  Animated,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

export default function Home({ navigation }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const handleLogOut = async () => {
    try {
      await signOut(auth);  
      Alert.alert("Sesión cerrada", "Has cerrado sesión correctamente.");
      navigation.replace('Login');  
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al cerrar sesión.");
    }
  };

  const toggleMenu = () => {
    if (menuVisible) {
      // Ocultar menú
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    } else {
      // Mostrar menú
      setMenuVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ImageBackground
        source={require('../assets/background.jpg')}
        style={styles.background}
        imageStyle = {{opacity: 0.9}} //opacidad
      >

        {/* Header con cuenta del tutor */}
          <View style={styles.header}>
            {/* Contenedor de Logo y nombre */}
            <View style={styles.headerLeft}>
              <Image source={require('../assets/piaget-icon.png')} style={styles.logo} />
              <View>
                <Text style={styles.headerTitle}>Instituto{"\n"}Jean Piaget <Text style={styles.headerNumber}>N°8048</Text></Text>
              </View>
            </View>

            {/* Íconos de Tutor en el header */}
            <View style={styles.headerRight}>
              <View style={styles.tutorIconBackground}>
                <FontAwesome name="user-circle-o" size={50.2} color="black" />
              </View>
              {/* Ícono de menú */}
              <TouchableOpacity onPress={toggleMenu} style={styles.menuIcon}>
                <MaterialCommunityIcons name="menu-down" size={34} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Menú para opción cerrar sesión */}
          <Modal
            transparent={true}
            visible={menuVisible}
            animationType="none"
            onRequestClose={toggleMenu}
          >
            <TouchableOpacity
              style={styles.menuOverlay}
              activeOpacity={1}
              onPress={toggleMenu}
            >
              <Animated.View 
                style={[
                  styles.button,
                  { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }
                ]}
              >
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    toggleMenu();
                    handleLogOut();
                  }}
                >
                  <Text style={styles.buttonText}>Cerrar sesión</Text>
                </TouchableOpacity>

              </Animated.View>
            </TouchableOpacity>
          </Modal>
          
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >

            {/* Botón Cerrar Sesión */}
            <TouchableOpacity style={styles.button} onPress={handleLogOut}>
              <Text style={styles.buttonText}>Cerrar sesión </Text>
              <Image 
                  source={require('../assets/icon-exit.png')}
                  style={styles.exitImage}
              />
            </TouchableOpacity>

            {/* Bienvenida Tutor */}
            <View style={styles.box}>
              <Text style={styles.title}>Bienvenido, Nombre Tutor!</Text>
              <Text style={styles.baseText}>
                Este espacio le permitirá seguir de cerca el progreso escolar de su hijo y mantenerse en contacto con la institución.
              </Text>
            </View>

            {/* Parte del fondo gris */}
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
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Jean Piaget</Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 0,
  },
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
  box: {
    backgroundColor: '#1E2A78', //color caja de texto de Bienvenida 
    borderRadius: 15, //bordes redondeados
    padding: 15, //espacio entre el texto y la caja
    paddingBottom: 27, //espacio inferior
    borderColor: '#000000ff', //color de borde de la caja de Bienvenida
    borderWidth: 1, //ancho del borde de la caja
    marginTop: 25,
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
    marginTop: 18, 
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
    marginBottom: 35,
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
    paddingTop: 30,
    paddingBottom: 30,
  }, // parte del fondo gris
  header: {
    flexDirection: "row",        // fila
    alignItems: "center",        // centrado vertical
    justifyContent: "space-between", //separa elementos
    backgroundColor: "#C8102E",
    paddingHorizontal: 10, // margen interno         
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2, // separa tutor de flecha
},
  logo: {
    width: 105,
    height: 105,
    resizeMode: "cover",
    marginTop: -15,
    marginBottom: -10,
    marginLeft: -15,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 28,
    marginLeft: -10,
  },
  headerNumber: {
    color: "#fff",
    fontSize: 13,
  },
  menuIcon: {
    padding: 5,
  },
  tutorIconBackground: {
    backgroundColor: '#fff',
    width: 50,
    height: 50,
    borderRadius: 70,
  }, //fondo circular del ícono de Tutor
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  topSection: {
    backgroundColor: "#1E2A78",
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    padding: 20,
    alignItems: "center",
    marginTop: 0,
    marginHorizontal:0,
    paddingTop: 20,
  }, 
  footer: {
    alignItems: "center",
    padding: 12,
    backgroundColor: "#1E2A78",
  }, //pie de página
  footerText: {
    fontSize: 14,
    color: "#ffffffff",
    marginBottom: 5,
  } //texto de pie de página
});
