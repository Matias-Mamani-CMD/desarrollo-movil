import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
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
import { useNavigation } from '@react-navigation/native'


export default function HomeSecretaria() {
  const navigation= useNavigation()

  const [menuVisible, setMenuVisible] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [showAlert, setShowAlert] = useState(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [onConfirm, setOnConfirm] = useState(() => () => {});
  
    const showCustomAlert = (title, message, confirmAction) => {
      setAlertTitle(title);
      setAlertMessage(message);
      setOnConfirm(() => confirmAction);
      setShowAlert(true);
    };
  
    const handleLogOut = async () => {
      try {
        await signOut(auth);  
        showCustomAlert(
          "¿Confirma que quiere cerrar sesión?",
          "Se cerrará su sesión actual.",
          () => {
            setShowAlert(false);
            navigation.replace('Login');
          }
        );
      } catch (error) {
        showCustomAlert(
          "Error",
          "Ha ocurrido un problema.",
          () => setShowAlert(false)
        );
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
                    <MaterialCommunityIcons name="bell" size={17} color="white" paddingTop={18} paddingRight={8}/>
                    <View style={styles.tutorIconBackground}>
                      <FontAwesome name="user-circle-o" size={45} color="black" style={styles.tutorIcon} />
                    </View>
                    {/* Ícono de menú */}
                    <TouchableOpacity onPress={toggleMenu} style={styles.menuIcon}>
                      <MaterialCommunityIcons name="menu-down" size={32} color="white" />
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
                    <Ionicons name="exit-outline" size={22} color="white" paddingLeft="5" />
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
                <Text style={styles.title}>Bienvenido, Nombre Empleado!</Text>
                <Text style={styles.baseText}>
                  Este espacio le permitirá gestionar la información administrativa de los alumnos y tutores del instituto.
                </Text>
              </View>
  
              {/* Parte del fondo gris */}
              
              
                <View style={styles.grayBackground}>
                  <View style={styles.whiteBox}>
                    <Image 
                    source={require('../assets/gestionalumnos.png')}
                    style={styles.alumnImage}
                    />
                  </View>
                  <TouchableOpacity style={styles.boxAlumnos} onPress={() => navigation.navigate('GestionarAlumnos')}>
                    <Text style={styles.textAlumnName}>Gestionar Alumnos</Text>
                  </TouchableOpacity>               
                </View>
                <View style={styles.grayBackground}>
                  <View style={styles.whiteBox}>
                    <Image 
                    source={require('../assets/Tutores.png')}
                    style={styles.tutorImage}
                    />
                  </View>
                  <TouchableOpacity style={styles.boxTutores} onPress={() => navigation.navigate('GestionarTutores')}>
                    <Text style={styles.textAlumnName}>Gestionar Tutores</Text>
                  </TouchableOpacity>                 
                </View>
              
              
              
  
              {/* Espacio adicional para asegurar que el footer se vea */}
              <View style={styles.spacer} />
  
              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>© 2025 Jean Piaget</Text>
              </View>
              {/* Modal de Alertas */}
              <Modal
                visible={showAlert}
                transparent
                animationType="fade"
                onRequestClose={() => setShowAlert(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContainer}>
                    <View style={styles.modalDetail}>
                      <Text style={styles.modalTitle}>{alertTitle}</Text>
                    </View>
                    <Text style={styles.modalMessage}>{alertMessage}</Text>
                    
                    <View style={styles.modalButtons}>
                      <TouchableOpacity
                        style={[styles.modalButton, {borderColor: "#252861"}]}
                        onPress={() => setShowAlert(false)}
                      >
                        <Text style={[styles.modalButtonText, {color: "#252861"}]}>Cancelar</Text>
                      </TouchableOpacity>
  
                      <TouchableOpacity
                        style={[styles.modalButton, { backgroundColor: "#DB2024", borderWidth: 0 }]}
                        onPress={() => {
                          onConfirm();
                        }}
                      >
                        <Text style={[styles.modalButtonText, { color: "#fff",}]}>Aceptar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
  
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
      marginTop: 40,
      padding: 15, //espacio entre el cuadro de Bienvenida y el fondo
      paddingBottom: 96,
      minHeight: '100%',
    },
    box: {
      backgroundColor: '#DB2024', //color caja de texto de Bienvenida 
      borderRadius: 10, //bordes redondeados
      padding: 14, //espacio entre el texto y la caja
      paddingBottom: 27, //espacio inferior
      borderColor: '#000000ff', //color de borde de la caja de Bienvenida
      borderWidth: 0.5, //ancho del borde de la caja
      marginBottom: 50, //separación inferior con la sección de Alumnos
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
      position: 'absolute',
      top: 60,
      right: 10,
      flexDirection: 'row',
      backgroundColor: '#252861', // color del botón de cerrar sesión
      paddingVertical: 7,
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
    boxAlumnos: {
      margin: 1,
      marginBottom: 1,
      backgroundColor: '#252861', //color de caja para seleccionar Alumno
      padding: "1.2%", //espaciado entre el texto y la caja
      width: "70%",
      alignItems: 'center', //centra horizontalmente
      justifyContent: 'center', //centra verticalmente
      boxShadow: '0px 0px 6px 0px #0000007e',
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
    },
    boxTutores: {
      margin: 1,
      marginBottom: 1,
      backgroundColor: '#252861', //color de caja para seleccionar Alumno
      padding: "1.2%", //espaciado entre el texto y la caja
      width: "70%",
      alignItems: 'center', //centra horizontalmente
      justifyContent: 'center', //centra verticalmente
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
      boxShadow: '0px 0px 6px 0px #0000007e',
    },
    textAlumnName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    paddingTop: 4,
    }, // nombre del alumno
    textYear: {
      color: '#fff',
      fontSize: 15,
      fontWeight: 'regular',
      textAlign: 'center',
    }, //año que cursa el alumno
    whiteBox: {
      backgroundColor: '#ffffffdc',
      width: '70%',
      height: '70%',
      boxShadow: '0px 0px 6px 0px #0000007e',
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
    },
    alumnImage: {
      marginHorizontal: -10,
      marginVertical: -8,
      display: 'flex',
      width: "110%",
      height: "110%",
    }, //íconos de alumnos
    tutorImage: {
      marginHorizontal: -40,
      marginVertical: -35.5,
      display: 'flex',
      width: "129%",
      height: "129%",
    }, //íconos de alumnos
    grayBackground: {
      backgroundColor: '#9b9b9ba1',
      flexDirection: 'column', // columna
      justifyContent: 'center',
      paddingVertical: 10,
      height: '30%',
      width: '110%',          // ocupa todo el ancho
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 50,
      boxShadow: '0px 1px 6px 0px #00000063',
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
  },
    headerBlue: {
      backgroundColor: "#252861",
      alignItems: 'flex-end',
      paddingTop: 4,
      width: '130',
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
      padding: 7.6,
      flexDirection: 'row',   // ícono y flecha en línea
    },
    tutorIconBackground: {
      backgroundColor: '#fff',
      width: 45.3,
      height: 45.3,
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
    width: '110%',
    alignItems: "center",
    padding: 15,
    backgroundColor: "#1E2A78",
    borderTopColor: "#FFD900",
    borderTopWidth: 1.5,
    },
    footerText: {
      fontSize: 13,
      color: "#fff",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      width: '85%',
      backgroundColor: '#fff',
      borderRadius: 12,
      paddingBottom: 20,
      elevation: 5,
      alignItems: 'center',
      boxShadow: '1px 1px 7px 3px #2727277e',
    },
    modalDetail: {
      backgroundColor: '#C81B1E',
      paddingHorizontal: 10,
      paddingVertical: 10,
      width: '100%',
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
    },
    modalTitle: {
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '500',
      margin: 8,
      color: "#ffffffff",
    },
    modalMessage: {
      fontSize: 16,
      marginTop: 20,
      marginBottom: 20,
      textAlign: "center",
      color: "#333",
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },
    modalButton: {
      flex: 1,
      backgroundColor: "#ffffffff",
      borderWidth: 2.5,
      marginHorizontal: 12,
      padding: 12,
      borderRadius: 6,
      alignItems: "center",
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: "500",
    },
  });