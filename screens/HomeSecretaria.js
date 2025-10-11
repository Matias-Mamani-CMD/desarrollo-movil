import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../src/config/firebaseConfig';
import { doc, getDoc} from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

export default function HomeSecretaria() {
  const navigation = useNavigation();

  const [menuVisible, setMenuVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [onConfirm, setOnConfirm] = useState(() => () => {});
  const isFocused = useIsFocused();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
  // Función para cargar los datos
  const fetchUserData = async () => {
    const user = auth.currentUser; 
    if (user) {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setNombre(userData.firstName);
        setApellido(userData.lastName);
        setImageUri(userData.photoURL || null);
      } else {
        console.log("No se encontraron datos para este usuario.");
      }
    } else {
      navigation.replace('Login');
    }
  };

  // Solo ejecuta la función si la pantalla está en foco
  if (isFocused) {
    fetchUserData();
  }

}, [isFocused]);

  

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

        {/* Header con cuenta del tutor - MANTENIENDO EXACTAMENTE EL ORIGINAL */}
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
                <View style={styles.tutorIconBackground}>
                  <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%', borderRadius: 50 }} resizeMode="cover"/>
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
                }}>
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
            {/* Bienvenida - JUSTO DEBAJO DEL NAVBAR Y 100% ANCHO */}
            <View style={styles.welcomeSection}>
              <View style={styles.welcomeBox}>
                <Text style={styles.welcomeTitle}>Bienvenido, {nombre} {apellido}!</Text>
                <Text style={styles.welcomeText}>
                  Este espacio le permitirá gestionar la información administrativa de los alumnos y tutores del instituto.
                </Text>
              </View>
            </View>

            {/* Contenido Principal - CON NUEVAS TARJETAS ESTILO HTML */}
            <View style={styles.content}>
              {/* Tarjeta Gestionar Alumnos */}
              <View style={styles.moduleCard}>
                <View style={styles.cardRedLine} />
                <View style={styles.cardHeader}>
                  {/* ESTILO ESPECÍFICO PARA ALUMNOS */}
                  <Image 
                    source={require('../assets/gestionalumnos.png')}
                    style={styles.cardIconAlumnos}
                  />
                  <View style={styles.cardTitleSection}>
                    <Text style={styles.cardTitle}>Gestionar</Text>
                    <Text style={styles.cardSubtitle}>Alumnos</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.cardFooter}
                  onPress={() => navigation.navigate('GestionarAlumnos')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cardDescription}>
                    Administre el registro de estudiantes, datos personales, observaciones y tutores a cargo.
                  </Text>
                  <Text style={styles.cardArrow}>›</Text>
                </TouchableOpacity>
              </View>

              {/* Tarjeta Gestionar Tutores */}
              <View style={styles.moduleCard}>
                <View style={styles.cardRedLine} />
                <View style={styles.cardHeader}>
                  {/* ESTILO ESPECÍFICO PARA TUTORES */}
                  <Image 
                    source={require('../assets/Tutores.png')}
                    style={styles.cardIconTutores}
                  />
                  <View style={styles.cardTitleSection}>
                    <Text style={styles.cardTitle}>Gestionar</Text>
                    <Text style={styles.cardSubtitle}>Tutores</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.cardFooter}
                  onPress={() => navigation.navigate('GestionarTutores')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cardDescription}>
                    Gestione la información de tutores y representantes legales, datos de contacto y vinculación familiar.
                  </Text>
                  <Text style={styles.cardArrow}>›</Text>
                </TouchableOpacity>
              </View>
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
                      <Text style={[styles.modalButtonText, { color: "#fff"}]}>Aceptar</Text>
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
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 0,
  },
  // Header 
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
    width: '130',
    height: '80',
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
  // Menu Styles 
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 10,
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 0,
    borderBottomColor: '#f0f0f0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '450',
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    paddingBottom: 3,
  },
  // Welcome 
  welcomeSection: {
    backgroundColor: '#252861',
    padding: 30,
    marginBottom: 30,
    width: '100%',
    alignSelf: 'stretch',
  },
  welcomeBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  welcomeTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.95,
  },
  // Content Area
  content: {
    width: '100%',
    paddingHorizontal: 20,
    alignSelf: 'stretch',
  },
  // Module Card
  moduleCard: {
    marginTop:25,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
  },
  cardRedLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: '#C81B1E',
    zIndex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingLeft: 26,
    backgroundColor: 'white',
  },

  cardIconAlumnos: {
    width: 200,  
    height: 100,
    marginRight: 15,
    resizeMode: 'contain',

  },
  cardIconTutores: {
    width: 200, 
    height: 100, 
    marginRight: 15,
    resizeMode: 'contain',

  },
  cardTitleSection: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  cardFooter: {
    backgroundColor: '#252861',
    padding: 15,
    paddingLeft: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -15,
  },
  cardDescription: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    paddingRight: 15,
  },
  cardArrow: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  // Footer y Espacio 
  spacer: {
    height: 20,
  },
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
    alignItems: 'center',
  },
  // Modal Styles - ORIGINALES
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
    borderWidth: 2,
    borderWidth: 1.5,
    borderColor: "#000000ff",
    shadowColor: '#000',
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.47,
    shadowRadius: 3,
    elevation: 5,
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
});