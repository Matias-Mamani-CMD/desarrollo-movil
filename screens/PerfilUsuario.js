import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Image,
  ImageBackground,
  ScrollView,
  Modal,
  Animated,
  TextInput // Se importa TextInput para los campos del formulario
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function PerfilUsuario() {
  const navigation = useNavigation();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');

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
      showCustomAlert(
        "¿Confirma que quiere cerrar sesión?",
        "Se cerrará su sesión actual.",
        async () => {
          await signOut(auth);
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
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    } else {
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

        {/* Header con cuenta del tutor - MANTENIDO EXACTAMENTE EL ORIGINAL */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={require('../assets/piaget-icon.png')} style={styles.logo} />
            <View>
              <Text style={styles.headerTitle}>Instituto{"\n"}Jean Piaget <Text style={styles.headerNumber}>N°8048</Text></Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.headerBlue}>
              <View style={styles.iconPlacing}>
                <View style={styles.tutorIconBackground}>
                  <FontAwesome name="user-circle-o" size={45} color="black" style={styles.tutorIcon} />
                </View>
                <TouchableOpacity onPress={toggleMenu} style={styles.menuIcon}>
                  <MaterialCommunityIcons name="menu-down" size={32} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

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
              <View>
                <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                toggleMenu();
                navigation.navigate('PerfilUsuario');
              }}>
                <Text style={styles.buttonText}>Ver Pefil</Text>
                <Ionicons name="person-outline" size={22} color="white" paddingLeft="5" />
              </TouchableOpacity>
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
              </View>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
        
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#252861" />
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>

          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Modificar Datos</Text>
            </View>

            <View style={styles.formBody}>
              <Text style={styles.inputLabel}>Nombre (user.name)</Text>
              <View style={styles.inputContainer}>
                <FontAwesome name="user" size={20} style={styles.inputIcon} />
                <TextInput
                  placeholder="Ingrese su nombre (Opcional)"
                  style={styles.textInput}
                  value={nombre}
                  onChangeText={setNombre}
                />
              </View>

              <Text style={styles.inputLabel}>Apellido (user.surname)</Text>
              <View style={styles.inputContainer}>
                <FontAwesome name="user" size={20} style={styles.inputIcon} />
                <TextInput
                  placeholder="Ingrese su apellido (Opcional)"
                  style={styles.textInput}
                  value={apellido}
                  onChangeText={setApellido}
                />
              </View>

              <Text style={styles.inputLabel}>Correo (user.correo)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} style={styles.inputIcon} />
                <TextInput
                  placeholder="Ingrese un nuevo correo (opcional)"
                  style={styles.textInput}
                  keyboardType="email-address"
                  value={correo}
                  onChangeText={setCorreo}
                />
              </View>
              <View style={styles.centerbox}>
                <TouchableOpacity style={[styles.boxEliminar]}>
                  <Text style={[styles.textAlumnName, {paddingTop: 0}]}>¿Cambiar Contraseña?</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.boxAñadir]}>
                  <Text style={[styles.textAlumnName, {paddingTop: 0}]}>Aceptar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View />
          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2025 Jean Piaget</Text>
          </View>

          {/* Modal de Alertas*/}
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
  // TUS ESTILOS ORIGINALES (SIN CAMBIOS)
  safeArea: {
    flex: 1,
    padding: 0,
    backgroundColor: '#000000c6',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  }, 
  container: {
    flexGrow: 1,
    alignItems: 'center',
    marginTop: 20,
    padding: 15, 
    paddingBottom: 0,
  },
  box: {
    backgroundColor: '#252861',
    borderRadius: 10,
    padding: 14,
    paddingBottom: 27,
    borderColor: '#000000ff',
    borderWidth: 0.5,
    marginBottom: 50,
    boxShadow: '1px 2px 6px 1px #0000007e',
  },
  title: {
    color: '#fff',
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 21,
    textAlign: 'left',
  },
  baseText:{
    color: '#fff',
    fontSize: 15,
    fontWeight: 'normal',
    marginBottom: 15,
  },
  button: {
    position: 'absolute',
    top: 60,
    right: 10,
    flexDirection: 'row',
    backgroundColor: '#252861',
    paddingVertical: 7,
    borderColor: '#000',
    borderWidth: 0.9,
    borderRadius: 5,
    marginTop: 18,
    alignSelf: 'flex-end',
    marginRight: -13,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    paddingBottom: 3,
  },
  centerbox: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 0,
},
boxAñadir: {
    margin: 0,
    marginBottom: 10,
    backgroundColor: '#252861',
    borderRadius: 8,
    paddingVertical: 15,   // <-- Corregido
    width: '50%',           

    alignItems: 'center',
    justifyContent: 'center',
},
boxEliminar: {
    margin: 0,
    marginBottom: 15,     
    backgroundColor: '#C81B1E',
    borderRadius: 8,
    paddingVertical: 15,   
    width: '50%',          

    alignItems: 'center',
    justifyContent: 'center',
},
  boxModificar: {
    margin: 10,
    marginBottom: 10,
    backgroundColor: '#231322',
    borderColor: '#252861',
    borderRadius: 15,
    padding: "6%",
    width: "94%",
    alignItems: 'center',
    justifyContent: 'center',
  },
  textAlumnName: {
    color: '#fff',
    fontSize: 16.5,
    fontWeight: 'bold',
    paddingTop: 4,
  },
  textYear: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'normal',
    textAlign: 'center',
  },
  circleBackground: {
    backgroundColor: '#fff',
    width: 102,
    height: 102,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alumnImage: {
    marginHorizontal: 5,
    width: 90,
    height: 90,
    marginBottom: 8,
  },
  grayBackground: {
    backgroundColor: '#bdbdbdab',
    flexDirection: 'row',
    paddingVertical: 10,
    width: '100%',
    height: '20%',
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    width: '130', // Ancho ajustado para íconos
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
    flexDirection: 'row',
    alignItems: 'center'
  },
  tutorIconBackground: {
    backgroundColor: '#fff',
    width: 45.3,
    height: 45.3,
    borderRadius: 70,
  },
  tutorIcon: {}, // Estilo original
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
    height: 20,
  },
  // FOOTER 
  footer: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
    width: '111%',
    backgroundColor: "#1E2A78",
    marginTop: 'auto',
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
    borderWidth: 1.5,
    borderColor: "#000000ff",
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
    fontWeight: "bold",
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
    fontWeight: "bold",
  },

  // --- NUEVOS ESTILOS AÑADIDOS PARA EL FORMULARIO ---
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#252861',
    marginLeft: 5,
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  formHeader: {
    backgroundColor: '#252861',
    paddingVertical: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  formTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  formBody: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  inputIcon: {
    padding: 10,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 10,
    fontSize: 16,
  },
});