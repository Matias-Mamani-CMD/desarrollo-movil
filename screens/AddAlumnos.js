import React, { useState, useEffect, useCallback } from 'react'; 
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
  TextInput,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../src/config/firebaseConfig'; // Asegúrate que la ruta es correcta
import { FontAwesome, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

export default function AddAlumnos() {
  const navigation = useNavigation();

  // Estado para el modal de la imagen
  const [imageModalVisible, setImageModalVisible] = useState(false);


  // Datos del Alumno
  const [nombreAlumno, setNombreAlumno] = useState('');
  const [apellidoAlumno, setApellidoAlumno] = useState('');
  const [dniAlumno, setDniAlumno] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [genero, setGenero] = useState('Masculino');
  
  // Nuevos estados para manejar los grados
  const [gradoSeleccionado, setGradoSeleccionado] = useState(''); // ID del grado elegido
  const [grados, setGrados] = useState([]); // Array para guardar los grados desde Firestore

  // Datos del Tutor
  const [nombreTutor, setNombreTutor] = useState('');
  const [apellidoTutor, setApellidoTutor] = useState('');
  const [dniTutor, setDniTutor] = useState('');
  const [correoTutor, setCorreoTutor] = useState('');
  const [parentesco, setParentesco] = useState('Padre');

  // --- ESTADOS DE LA PÁGINA ---
  const [menuVisible, setMenuVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [onConfirm, setOnConfirm] = useState(() => () => {});
  const isFocused = useIsFocused();
  const [imageUri, setImageUri] = useState(null);
    
  // --- FUNCIONES (LOGOUT, ALERTAS, MENÚ) ---
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
  
  // Usamos useEffect para cargar los grados desde Firestore cuando la pantalla se carga
  useFocusEffect(
    useCallback(() => {
      const fetchGrados = async () => {
        try {
          // Creamos una consulta a la colección 'grados'
          // donde los 'asientos_disponibles' sean mayores a 0
          const q = query(collection(db, "grados"), where("asientos_disponibles", ">", 0), orderBy("año", "asc"));
          const querySnapshot = await getDocs(q);
          
          const gradosDisponibles = [];
          querySnapshot.forEach((doc) => {
            // Guardamos el id del documento y sus datos
            gradosDisponibles.push({ id: doc.id, ...doc.data() });
          });
          
          setGrados(gradosDisponibles); // Actualizamos el estado con los grados encontrados
        } catch (error) {
          console.error("Error al obtener los grados: ", error);
          // Opcional: mostrar una alerta al usuario
          showCustomAlert("Error", "No se pudieron cargar los grados disponibles.", () => {});
        }
      };

      fetchGrados(); // Ejecutamos la función

    }, []) // El array vacío aquí es correcto para useCallback
  );


  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ImageBackground
          source={require('../assets/background.jpg')}
          style={styles.background}
          resizeMode="cover"
        >
            {/* Header */}
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
            
            {/* NAVEGACIÓN SUPERIOR */}
            <View style={styles.topNav}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color="#333" />
                <Text style={styles.backButtonText}>Volver</Text>
              </TouchableOpacity>
            </View>

            {/* ScrollView para contener el formulario */}
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
              
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>Registro Alumno</Text>

                {/* --- SECCIÓN DATOS DEL ALUMNO --- */}
                <Text style={styles.label}>Nombre:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ingrese el nombre"
                  value={nombreAlumno}
                  onChangeText={setNombreAlumno}
                />

                <Text style={styles.label}>Apellido:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ingrese el apellido"
                  value={apellidoAlumno}
                  onChangeText={setApellidoAlumno}
                />

                <Text style={styles.label}>DNI:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ingrese el DNI"
                  keyboardType="numeric"
                  value={dniAlumno}
                  onChangeText={setDniAlumno}
                />

                <Text style={styles.label}>Fecha de nacimiento:</Text>
                <View style={styles.dateInputContainer}>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="DD-MM-AAAA"
                    value={fechaNacimiento}
                    onChangeText={setFechaNacimiento}
                  />
                  <FontAwesome name="calendar" size={20} color="#666" />
                </View>

                <Text style={styles.label}>Género:</Text>
                <View style={styles.genderContainer}>
                  <TouchableOpacity style={styles.checkboxWrapper} onPress={() => setGenero('Masculino')}>
                    <View style={[styles.checkbox, genero === 'Masculino' && styles.checkboxSelected]}>
                      {genero === 'Masculino' && <Ionicons name="checkmark" size={18} color="white" />}
                    </View>
                    <Text style={styles.checkboxLabel}>Masculino</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.checkboxWrapper} onPress={() => setGenero('Femenino')}>
                    <View style={[styles.checkbox, genero === 'Femenino' && styles.checkboxSelected]}>
                       {genero === 'Femenino' && <Ionicons name="checkmark" size={18} color="white" />}
                    </View>
                    <Text style={styles.checkboxLabel}>Femenino</Text>
                  </TouchableOpacity>
                </View>

                {/* Nuevo campo para seleccionar el Grado */}
                <Text style={styles.label}>Grado:</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={gradoSeleccionado}
                    onValueChange={(itemValue) => setGradoSeleccionado(itemValue)}
                    style={styles.picker}
                    dropdownIconColor="#252861"
                    enabled={grados.length > 0} // El picker se deshabilita si no hay grados
                  >
                    <Picker.Item label="Seleccione un grado..." value="" />
                    {grados.map((grado) => (
                      <Picker.Item key={grado.id} label={`${grado.nombre_grado} (${grado.asientos_disponibles} asientos)`} value={grado.id} />
                    ))}
                  </Picker>
                </View>

                {/* --- SECCIÓN DATOS DEL TUTOR --- */}
                <View style={styles.divider} />
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Datos del Tutor</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={parentesco}
                      onValueChange={(itemValue) => setParentesco(itemValue)}
                      style={styles.picker}
                      dropdownIconColor="#252861"
                    >
                      <Picker.Item label="Padre" value="Padre" />
                      <Picker.Item label="Madre" value="Madre" />
                      <Picker.Item label="Tutor Legal" value="Tutor Legal" />
                    </Picker>
                  </View>
                </View>

                <Text style={styles.label}>Nombre:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ingrese el nombre"
                  value={nombreTutor}
                  onChangeText={setNombreTutor}
                />

                <Text style={styles.label}>Apellido:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ingrese el apellido"
                  value={apellidoTutor}
                  onChangeText={setApellidoTutor}
                />
                
                <Text style={styles.label}>DNI:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ingrese el DNI"
                  keyboardType="numeric"
                  value={dniTutor}
                  onChangeText={setDniTutor}
                />

                <Text style={styles.label}>Correo:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ingrese el correo"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={correoTutor}
                  onChangeText={setCorreoTutor}
                />

                {/* --- BOTONES DE ACCIÓN --- */}
                <View style={styles.actionsContainer}>
                  <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={() => navigation.goBack()}>
                    <Text style={[styles.actionButtonText, styles.cancelButtonText]}>CANCELAR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.confirmButton]}>
                    <Text style={[styles.actionButtonText, styles.confirmButtonText]}>CONFIRMAR</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </ScrollView>

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


// const styles = StyleSheet.create({ ... });
  
  // --- ESTILOS ---
  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#f0f2f5',
    },
    background: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#C81B1E",
    },
    headerLeft: { flexDirection: "row", alignItems: "center" },
    headerRight: { flexDirection: "row", alignItems: "center" },
    headerBlue: {
      backgroundColor: "#252861",
      alignItems: 'flex-end',
      paddingTop: 4,
      width: 130,
      height:80,
    },
    logo: {
      width: 105, height: 105, resizeMode: "cover",
      marginTop: -15, marginBottom: -10, marginLeft: -15,
    },
    headerTitle: {
      color: "#fff", fontSize: 24, fontWeight: "800",
      lineHeight: 28, marginLeft: -10,
    },
    headerNumber: { color: "#fff", fontSize: 13 },
    menuIcon: { paddingTop: 28 },
    iconPlacing: { padding: 7.6, flexDirection: 'row' },
    tutorIconBackground: {
      backgroundColor: '#fff', width: 45.3, height: 45.3, borderRadius: 70,
    },
    
    // --- NUEVOS ESTILOS PARA EL FORMULARIO ---
    topNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 15,
      paddingTop: 15,
      paddingBottom: 10,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginLeft: 5,
    },
    topNavTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#C81B1E',
      textDecorationLine: 'underline',
    },
    scrollContainer: {
      flexGrow: 1,
      alignItems: 'center',
      paddingBottom: 40,
    },
    formContainer: {
      width: '90%',
      backgroundColor: 'white',
      borderRadius: 15,
      padding: 20,
      marginTop: 10,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    formTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#252861',
      textAlign: 'center',
      marginBottom: 25,
      borderBottomWidth: 2,
      borderBottomColor: '#f0f2f5',
      paddingBottom: 10,
    },
    label: {
      fontSize: 16,
      color: '#333',
      marginBottom: 5,
      fontWeight: '500',
    },
    input: {
      backgroundColor: '#f0f2f5',
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      paddingHorizontal: 15,
      paddingVertical: 12,
      fontSize: 16,
      marginBottom: 15,
    },
    dateInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f0f2f5',
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      marginBottom: 15,
      paddingHorizontal: 15,
    },
    dateInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 16,
    },
    genderContainer: {
      flexDirection: 'row',
      marginBottom: 20,
    },
    checkboxWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 30,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: '#252861',
      borderRadius: 4,
      marginRight: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxSelected: {
      backgroundColor: '#252861',
    },
    checkboxLabel: {
      fontSize: 16,
    },
    divider: {
      height: 2,
      backgroundColor: '#f0f2f5',
      marginVertical: 15,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#252861',
      textDecorationLine: 'underline',
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      backgroundColor: '#f0f2f5',
      flex: 0.8, // Para que ocupe menos espacio que el título
    },
    picker: {
      height: 50,
      // En iOS es necesario ajustar el contenedor, no el picker directamente
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 30,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 5,
    },
    cancelButton: {
      backgroundColor: 'white',
      borderWidth: 2,
      borderColor: '#C81B1E',
    },
    confirmButton: {
      backgroundColor: '#252861',
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    cancelButtonText: {
      color: '#C81B1E',
    },
    confirmButtonText: {
      color: 'white',
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
    buttonText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '400',
      borderBottomWidth: 1,
      borderBottomColor: '#fff',
      paddingBottom: 3,
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