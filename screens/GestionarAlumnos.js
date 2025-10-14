import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Image,
  ImageBackground,
  Modal,
  Animated,
  FlatList,
  TextInput,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore'; 
import { signOut } from 'firebase/auth';
import { auth, db } from '../src/config/firebaseConfig'; // Asegúrate que la ruta es correcta
import { FontAwesome, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// CORREGIDO: Datos de ejemplo para alumnos
const mockAlumnos = [
  {
    dni_alumno: '50123456',
    nombre_alumno: 'Julieta',
    apellido_alumno: 'Gonzalez',
    correo_tutor: 'correo.tutor1@gmail.com', // Mantenemos el correo del tutor como referencia
  },
  {
    dni_alumno: '51987654',
    nombre_alumno: 'Lucas',
    apellido_alumno: 'Rodriguez',
    correo_tutor: 'ana.garcia@example.com',
  },
  {
    dni_alumno: '49876543',
    nombre_alumno: 'Martina',
    apellido_alumno: 'Fernandez',
    correo_tutor: 'juan.perez@example.com',
  },
];


export default function GestionarAlumnos() {
  const navigation = useNavigation();
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [onConfirm, setOnConfirm] = useState(() => () => {});
  const isFocused = useIsFocused();
  const [imageUri, setImageUri] = useState(null);

  // Estado para el modal de la imagen
  const [imageModalVisible, setImageModalVisible] = useState(false);
  
  const [searchText, setSearchText] = useState('');
      
  const showCustomAlert = (title, message, confirmAction) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setOnConfirm(() => confirmAction);
    setShowAlert(true);
  };

  useEffect(() => {
    // Función para cargar los datos
    const fetchUserData = async () => {
      const user = auth.currentUser; 
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          const userData = docSnap.data();
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

  // Función para renderizar la tarjeta de un alumno
  const renderAlumnoItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nombre:</Text>
            <Text style={styles.infoValue}>{item.nombre_alumno}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Apellido:</Text>
            <Text style={styles.infoValue}>{item.apellido_alumno}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Correo Tutor:</Text>
            <Text style={styles.infoValue}>{item.correo_tutor}</Text>
          </View>
        </View>
        <View style={styles.cardId}>
          <FontAwesome name="user-circle" size={50} color="white" style={styles.cardIdIcon} />
          <Text style={styles.cardIdText}>DNI: {item.dni_alumno}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.actionButton, styles.viewButton]}>
          <Ionicons name="eye-outline" size={16} color="#333" />
          <Text style={styles.actionButtonText}>Ver Datos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.modifyButton]}>
          <MaterialCommunityIcons name="pencil" size={16} color="white" />
          {/* CORREGIDO: Texto del botón */}
          <Text style={[styles.actionButtonText, { color: 'white' }]}>Modificar Alumno</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]}>
          <MaterialCommunityIcons name="delete" size={16} color="white" />
           {/* CORREGIDO: Texto del botón */}
          <Text style={[styles.actionButtonText, { color: 'white' }]}>Eliminar Alumno</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
      
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ImageBackground
          source={require('../assets/background.jpg')}
          style={styles.background}
          resizeMode="cover"
        >
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
                    
                    {/* Imagen de perfil envuelta en TouchableOpacity */}
                    <TouchableOpacity onPress={() => imageUri && setImageModalVisible(true)}>
                      <View style={styles.tutorIconBackground}>
                        <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%', borderRadius: 50 }} resizeMode="cover"/>
                      </View>
                    </TouchableOpacity>
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
            
          <View style={styles.mainContainer}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('HomeSecretaria')}>
                <Ionicons name="chevron-back" size={24} color="#333" />
                <Text style={styles.backButtonText}>Volver</Text>
              </TouchableOpacity>

              <View style={styles.listContentContainer}>
                <View style={styles.listHeader}>
                   {/* Título de la lista */}
                  <Text style={styles.listTitle}>Lista Alumnos</Text>
                  {/*Texto del botón */}
                  <TouchableOpacity style={styles.newButton} onPress={() => navigation.navigate('AddAlumnos')}>
                    <Text style={styles.newButtonText}>Nuevo Alumno +</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por DNI"
                    value={searchText}
                    onChangeText={setSearchText}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity style={styles.searchIcon}>
                    <Ionicons name="search" size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={mockAlumnos}
                  renderItem={renderAlumnoItem}
                  //  Usar el DNI del alumno como key
                  keyExtractor={(item) => item.dni_alumno}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>© 2025 Jean Piaget</Text>
            </View>

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
            {/* Modal pra ver la imagen de perfil */}
            <Modal
              animationType="fade"
              transparent={true}
              visible={imageModalVisible}
              onRequestClose={() => setImageModalVisible(false)}
            >
              <TouchableOpacity 
                style={styles.imageModalContainer} 
                activeOpacity={1} 
                onPress={() => setImageModalVisible(false)}
              >
                <Image
                  source={{ uri: imageUri }}
                  style={styles.fullScreenImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </Modal>
        </ImageBackground>
      </SafeAreaView>
    );
  }
  
  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#f0f2f5',
    },
    background: {
      flex: 1,
      width: '100%',
      height: '100%',
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
      fontWeight: '400',
      borderBottomWidth: 1,
      borderBottomColor: '#fff',
      paddingBottom: 3,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#C81B1E",
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 3,
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
      width: 130,
      height:80,
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
    },
    tutorIconBackground: {
      backgroundColor: '#fff',
      width: 45.3,
      height: 45.3,
      borderRadius: 70,
    },
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
    },
    footer: {
      alignItems: "center",
      paddingVertical: 15,
      width: '100%',
      backgroundColor: "#1E2A78",
      borderTopWidth: 2,
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
      borderColor: "#000",
      shadowColor: '#272727',
      shadowOffset: { width: 1, height: 1 },
      shadowOpacity: 0.5,
      shadowRadius: 7,
    },
    modalDetail: {
      backgroundColor: '#C81B1E',
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
      color: "#fff",
    },
    modalMessage: {
      fontSize: 16,
      marginTop: 20,
      marginBottom: 20,
      textAlign: "center",
      color: "#333",
      paddingHorizontal: 10,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      paddingHorizontal: 10,
    },
    modalButton: {
      flex: 1,
      backgroundColor: "#fff",
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
    mainContainer: {
      flex: 1,
      paddingHorizontal: 15,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 15,
      marginBottom: 10,
    },
    backButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginLeft: 5,
    },
    listContentContainer: {
      flex: 1,
      backgroundColor: '#f0f2f5',
      borderRadius: 15,
      padding: 15,
    },
    listHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    listTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#252861',
      textDecorationLine: 'underline',
    },
    newButton: {
      backgroundColor: '#252861',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    newButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 14,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'white',
      borderRadius: 10,
      paddingHorizontal: 10,
      marginBottom: 20,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
    },
    searchInput: {
      flex: 1,
      height: 45,
      fontSize: 16,
    },
    searchIcon: {
      marginLeft: 10,
    },
    card: {
      backgroundColor: 'white',
      borderRadius: 10,
      marginBottom: 15,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      overflow: 'hidden',
    },
    cardContent: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    cardInfo: {
      flex: 1,
      padding: 15,
    },
    infoRow: {
      flexDirection: 'row',
      marginBottom: 8,
      alignItems: 'center',
    },
    infoLabel: {
      fontWeight: 'bold',
      fontSize: 14,
      color: '#333',
      width: 90, // Un poco más de ancho para "Correo Tutor"
    },
    infoValue: {
      fontSize: 14,
      color: '#555',
      flex: 1,
    },
    cardId: {
      backgroundColor: '#252861',
      width: 120,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 10,
    },
    cardIdIcon: {
      marginBottom: 10,
    },
    cardIdText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    cardActions: {
      flexDirection: 'row',
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 12,
    },
    actionButtonText: {
      marginLeft: 8,
      fontSize: 12,
      fontWeight: 'bold',
    },
    viewButton: {
      backgroundColor: '#f0f2f5',
    },
    modifyButton: {
      backgroundColor: '#3949ab',
    },
    deleteButton: {
      backgroundColor: '#C81B1E',
    },
  //  ESTILOS PARA EL MODAL DE IMAGEN
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '90%',
    height: '80%',
    borderRadius: 15,
  },
});