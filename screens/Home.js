import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Image,
  ImageBackground, //imágen de fondo
  ScrollView, // pantalla desplazable
  Modal, // menú cerrar sesión
  Animated, // animación botón de menú
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

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
        resizeMode="cover"
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
              <View style={styles.headerBlue}>
                <View style={styles.iconPlacing}>
                  {/* Ícono de tutor */}
                  <MaterialCommunityIcons name="bell" size={19} color="white" paddingTop={18} paddingRight={8}/>
                  <View style={styles.tutorIconBackground}>
                    <FontAwesome name="user-circle-o" size={50.2} color="black" />
                  </View>
                  {/* Ícono de menú */}
                  <TouchableOpacity onPress={toggleMenu} style={styles.menuIcon}>
                    <MaterialCommunityIcons name="menu-down" size={34} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
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
                  <Ionicons name="exit-outline" size={24} color="white" paddingLeft="5" />
                </TouchableOpacity>

              </Animated.View>
            </TouchableOpacity>
          </Modal>
          
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
            {/* Bienvenida Tutor */}
            <View style={styles.box}>
              <Text style={styles.title}>Bienvenido, Nombre Tutor!</Text>
              <Text style={styles.baseText}>
                Este espacio le permitirá seguir de cerca el progreso escolar de su hijo.
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
            </View>
            <View style={styles.grayBackground}>
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

            {/* Espacio adicional para asegurar que el footer se vea */}
            <View style={styles.spacer} />

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>© 2025 Jean Piaget</Text>
            </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 0,
    backgroundColor: '#000000c6',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  }, //mostrar fondo
  container: {
    flexGrow: 1,
    alignItems: 'center',
    marginTop: 49,
    padding: 20, //espacio entre el cuadro de Bienvenida y el fondo
    paddingBottom: 0,
  },
  box: {
    backgroundColor: '#DB2024', //color caja de texto de Bienvenida 
    borderRadius: 10, //bordes redondeados
    padding: 15, //espacio entre el texto y la caja
    paddingBottom: 27, //espacio inferior
    borderColor: '#000000ff', //color de borde de la caja de Bienvenida
    borderWidth: 0.5, //ancho del borde de la caja
    marginBottom: 60, //separación inferior con la sección de Alumnos
    boxShadow: '1px 2px 6px 1px #0000007e',
  },
  title: {
    color: '#fff', //color de fuente en el título de Bienvenida
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 21,
    textAlign: 'left', //texto principal de Bienvenida a Tutor
  },
  baseText:{
    color: '#fff',
    fontSize: 15,
    fontWeight: 'regular',
    marginBottom: 15,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#252861', // color del botón de cerrar sesion
    paddingVertical: 8, 
    paddingHorizontal: 4,
    borderColor: '#000',
    borderWidth: 0.9,
    borderRadius: 5, //bordes redondeados
    marginTop: 18,
    alignSelf: 'flex-end',
    marginRight: -13,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '450',
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    paddingBottom: 3,
  },
  boxAlumn: {
    margin: 10,
    marginBottom: 10,
    backgroundColor: '#252861', //color de caja para seleccionar Alumno
    borderRadius: 15, //bordes redondeados
    padding: 20, //espaciado entre el texto y la caja
    width: 350,
    alignItems: 'center', //centra horizontalmente
    justifyContent: 'center', //centra verticalmente
  },
  textAlumnName: {
    color: '#fff',
    fontSize: 16.5,
    fontWeight: 'bold',
    paddingTop: 4,
  }, // nombre del alumno
  textYear: {
    color: '#fff',
    fontSize: 15,
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
    width: 90,
    height: 90,
    marginBottom: 8,
  }, //íconos de alumnos
  grayBackground: {
    backgroundColor: '#bdbdbdab',
    paddingVertical: 10,
    width: '110%',          // ocupa todo el ancho
    alignItems: 'center',
    marginBottom: 30,
  }, // parte del fondo gris
  header: {
    flexDirection: "row",        // fila
    alignItems: "center",        // centrado vertical
    justifyContent: "space-between", // separa elementos
    backgroundColor: "#C81B1E",
    boxShadow: '6px 2px 6px 1px #0000007e',
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
  headerBlue: {
    backgroundColor: "#252861",
    alignItems: 'flex-end',
    width: '140',
    height:'80',
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
    paddingTop: 28,
  },
  iconPlacing: {
    padding: 10,
    flexDirection: 'row',   // ícono y flecha en línea
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
    borderBottomWidth: 0,
    borderBottomColor: '#f0f0f0',
  },
  spacer: {
    height: 20, // Espacio entre el último elemento y el footer
  },
  footer: {
    alignItems: "center",
    paddingTop: 15,
    paddingBottom: 60,
    width: '111%',
    backgroundColor: "#1E2A78",
    borderTopColor: "#FFD900",
    borderTopWidth: 2,
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 13,
    color: "#fff",
  }
});