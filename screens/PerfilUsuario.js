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
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { signOut, onAuthStateChanged, updateEmail } from 'firebase/auth';
import * as LocalAuthentication from 'expo-local-authentication';
import { auth, db } from '../src/config/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

export default function PerfilUsuario() {
  const navigation = useNavigation();

  // Estados para los datos del usuario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [imageUri, setImageUri] = useState(null);

  // Estados para la UI y el flujo
  const [isUploading, setIsUploading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showAlert, setShowAlert] = useState(false);
  const [showAlertPerfil, setShowAlertPerfil] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [onConfirm, setOnConfirm] = useState(() => () => {});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const isFocused = useIsFocused();

  //Validadores
  const validadorcaracteres = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+$/;
  const validadorEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  //Enfoqued e los campos
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const handlenombre = (firstname) => {
    if (firstname === '' || validadorcaracteres.test(firstname)) {
      setNombre(firstname);
    }
  };

  const handleapellido = (lastname) => {
    if (lastname === '' || validadorcaracteres.test(lastname)) {
      setApellido(lastname);
    }
  };

  useEffect(() => {
    // Función para cargar los datos del usuario cuando la pantalla está en foco
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setNombre(userData.firstName);
          setApellido(userData.lastName);
          setCorreo(userData.email);
          setImageUri(userData.photoURL || null);
        } else {
          console.log("No se encontraron datos para este usuario.");
        }
      } else {
        navigation.replace('Login');
      }
    };
  
    if (isFocused) {
      fetchUserData();
    }
  
  }, [isFocused]);

  const pickImage = async () => {

  try {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert("¡Permiso denegado! No se puede acceder a la galería.");
      return;
    }

    // Usa 'images' como string
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    } 
  } catch (error) {
    alert("Ocurrió un error al intentar abrir la galería.");
  }
};
  // Sube la imagen seleccionada a Cloudinary
  const uploadImageToCloudinary = async (uri) => {
    const CLOUD_NAME = "drrfdxlr9"; 
    const UPLOAD_PRESET = "ml_default";

    const formData = new FormData();
    formData.append('file', {
      uri: uri,
      type: `image/${uri.split('.').pop()}`,
      name: `upload.${uri.split('.').pop()}`,
    });
    formData.append('upload_preset', UPLOAD_PRESET);

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    
    setIsUploading(true);
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = await response.json();
      if (data.secure_url) {
        return data.secure_url;
      }
    } catch (error) {
      console.error("Error al subir la imagen: ", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Manejo de la actualización completa del perfil
  // Función para verificar biometría
const authenticateWithBiometrics = async () => {
  try {
    // Verificar si el dispositivo tiene hardware biométrico
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      showCustomAlertPerfil(
        "No disponible",
        "Tu dispositivo no tiene autenticación biométrica disponible.",
        () => setShowAlertPerfil(false)
      );
      return false;
    }

    // Verificar si hay datos biométricos guardados
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      showCustomAlertPerfil(
        "No configurado",
        "No hay huella dactilar o Face ID configurado en tu dispositivo.",
        () => setShowAlertPerfil(false)
      );
      return false;
    }

    // Solicitar autenticación biométrica
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Confirma tu identidad para actualizar el perfil",
      cancelLabel: "Cancelar",
      disableDeviceFallback: false, // Permite usar PIN/patrón como alternativa
    });

    return result.success;
  } catch (error) {
    console.error("Error en autenticación biométrica:", error);
    return false;
  }
};

const handleUpdateProfile = async () => {
  if (!validadorEmail.test(correo)) {
    showCustomAlertPerfil("Error", "El Formato del correo es invalido.", () => setShowAlertPerfil(false));
    setIsSaving(false);
    return;
  }

  // AUTENTICACIÓN BIOMÉTRICA ANTES DE PROCEDER
  const isAuthenticated = await authenticateWithBiometrics();
  if (!isAuthenticated) {
    showCustomAlertPerfil(
      "Autenticación fallida",
      "Debes autenticarte para actualizar tu perfil.",
      () => setShowAlertPerfil(false)
    );
    return;
  }

  setIsSaving(true);
  const user = auth.currentUser;
  if (!user) {
    showCustomAlertPerfil("Error", "No se pudo identificar al usuario.", () => setShowAlertPerfil(false));
    setIsSaving(false);
    return;
  }

  try {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      showCustomAlertPerfil("Error", "No se encontraron los datos del perfil.", () => setShowAlertPerfil(false));
      setIsSaving(false);
      return;
    }
    const currentUserData = docSnap.data();
    
    let newImageURL = currentUserData.photoURL;
    if (imageUri && imageUri.startsWith('file://')) {
      const uploadedURL = await uploadImageToCloudinary(imageUri);
      if (uploadedURL) {
        newImageURL = uploadedURL;
      } else {
        throw new Error("Fallo al subir la nueva imagen.");
      }
    }

    const dataToUpdate = {};
    const newFirstName = nombre.trim();
    const newLastName = apellido.trim();
    const newEmail = correo.trim();

    if (newFirstName && newFirstName !== currentUserData.firstName) dataToUpdate.firstName = newFirstName;
    if (newLastName && newLastName !== currentUserData.lastName) dataToUpdate.lastName = newLastName;
    if (newImageURL && newImageURL !== currentUserData.photoURL) dataToUpdate.photoURL = newImageURL;

    const emailHasChanged = newEmail && newEmail !== user.email;
    if (emailHasChanged) dataToUpdate.email = newEmail;

    if (Object.keys(dataToUpdate).length === 0) {
      showCustomAlertPerfil("Sin cambios", "No hay cambios nuevos por realizar.", () => setShowAlertPerfil(false));
      setIsSaving(false);
      return;
    }

    if (emailHasChanged) await updateEmail(user, newEmail);
    await updateDoc(docRef, dataToUpdate);

    if (emailHasChanged) {
      showCustomAlertPerfil(
        "Cambios Realizados",
        "Debes iniciar sesión con tu nuevo correo electrónico.",
        async () => {
          await signOut(auth);
          setShowAlertPerfil(false);
          navigation.replace('Login');
        }
      );
    } else {
      showCustomAlertPerfil(
        "Éxito",
        "Tu perfil ha sido actualizado correctamente.",
        () => setShowAlertPerfil(false)
      );
    }
  } catch (error) {
    console.error("Error al actualizar el perfil: ", error);
    let errorMessage = "Ocurrió un problema al actualizar tu perfil.";
    if (error.code === 'auth/requires-recent-login') {
      errorMessage = "Esta operación es sensible. Por favor, cierra sesión y vuelve a iniciarla antes de cambiar tu correo.";
    } else if (error.code === 'auth/email-already-in-use') {
      errorMessage = "El nuevo correo electrónico ya está en uso por otra cuenta.";
    }
    showCustomAlertPerfil("Error", errorMessage, () => setShowAlertPerfil(false));
  } finally {
    setIsSaving(false);
  }
};

  const showCustomAlert = (title, message, confirmAction) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setOnConfirm(() => confirmAction);
    setShowAlert(true);
  };

  const showCustomAlertPerfil = (title, message, confirmAction) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setOnConfirm(() => confirmAction);
    setShowAlertPerfil(true);
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
                    <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%', borderRadius: 50 }} resizeMode="cover"/>
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
            <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={toggleMenu}>
                <Animated.View style={[styles.button, { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }]}>
                    <View>
                        <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); navigation.navigate('PerfilUsuario'); }}>
                            <Text style={styles.buttonText}>Ver Perfil</Text>
                            <Ionicons name="person-outline" size={22} color="white" style={{paddingLeft: 5}} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); handleLogOut(); }}>
                            <Text style={styles.buttonText}>Cerrar sesión</Text>
                            <Ionicons name="exit-outline" size={22} color="white" style={{paddingLeft: 5}} />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
        <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : "height"}
                  style={styles.keyboardAvoidingView}
                  keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
                >
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

              <View style={styles.avatarContainer}>
                <Image
                  source={imageUri ? { uri: imageUri } : require('../assets/piaget-icon.png')}
                  style={styles.avatar}
                />
                <TouchableOpacity onPress={pickImage} style={styles.changePicButton} disabled={isUploading}>
                  <Text style={styles.changePicButtonText}>Cambiar foto</Text>
                </TouchableOpacity>
                {isUploading && <ActivityIndicator style={{ marginTop: 10 }} size="small" color="#252861" />}
              </View>

              <View style={styles.formBody}>
                <Text style={styles.inputLabel}>Nombre ({nombre})</Text>
                <View style={[styles.inputContainer, firstNameFocused && styles.inputContainerFocused]}>
                  <FontAwesome name="user" size={20} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Ingrese su nombre (Opcional)"
                    style={styles.textInput}
                    value={nombre}
                    onChangeText={handlenombre}
                    onFocus={() => setFirstNameFocused(true)}
                    onBlur={() => setFirstNameFocused(false)}
                  />
                </View>

                <Text style={styles.inputLabel}>Apellido ({apellido})</Text>
                <View style={[styles.inputContainer, lastNameFocused && styles.inputContainerFocused]}>
                  <FontAwesome name="user" size={20} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Ingrese su apellido (Opcional)"
                    style={styles.textInput}
                    value={apellido}
                    onChangeText={handleapellido}
                    onFocus={() => setLastNameFocused(true)}
                    onBlur={() => setLastNameFocused(false)}
                  />
                </View>
                {/* Validación del correo */}
                <Text style={styles.inputLabel}>Correo ({correo})</Text>
                <View style={[styles.inputContainer, emailFocused && styles.inputContainerFocused]}>
                  <Ionicons name="mail" size={20} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Ingrese un nuevo correo (opcional)"
                    style={styles.textInput}
                    keyboardType="email-address"
                    value={correo}
                    onChangeText={setCorreo}
                    autoCapitalize='none'
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>

                {(emailFocused || correo.length > 0) && (
                  <Text
                    style={[
                      styles.validationText,
                      validadorEmail.test(correo) ? styles.valid : styles.invalid,
                      { marginLeft: 18, marginBottom: 3 }
                    ]}
                  >
                    {validadorEmail.test(correo) 
                      ? "Correo válido" 
                      : "Formato de correo incorrecto"}
                  </Text>
                )}
                <View style={styles.centerbox}>
                  <TouchableOpacity style={[styles.boxEliminar]} onPress={() => {
                    navigation.navigate('ForgotPassword');
                    }}>
                    <Text style={[styles.textAlumnName, {paddingTop: 0}]}>¿Cambiar Contraseña?</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={[styles.boxAñadir]} onPress={handleUpdateProfile} disabled={isSaving || isUploading}>
                    <Text style={[styles.textAlumnName, {paddingTop: 0}]}>{isSaving || isUploading ? 'Guardando...' : 'Aceptar'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={styles.spacer} />
            <View style={styles.footer}>
              <Text style={styles.footerText}>© 2025 Jean Piaget</Text>
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
                    onPress={() => onConfirm()}
                  >
                    <Text style={[styles.modalButtonText, { color: "#fff"}]}>Aceptar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Modal de Alertas de Perfil */}
          <Modal
            visible={showAlertPerfil}
            transparent
            animationType="fade"
            onRequestClose={() => setShowAlertPerfil(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalDetail}>
                  <Text style={styles.modalTitle}>{alertTitle}</Text>
                </View>
                <Text style={styles.modalMessage}>{alertMessage}</Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: "#DB2024", borderWidth: 0, flex: 0, paddingHorizontal: 40 }]}
                    onPress={() => onConfirm()}
                  >
                    <Text style={[styles.modalButtonText, { color: "#fff"}]}>Aceptar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    padding: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#C81B1E",
    elevation: 6,
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
    height: 80,
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
  tutorIcon: {},
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 85,
    paddingRight: 10,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#252861',
    paddingVertical: 7,
    borderColor: '#000',
    borderWidth: 0.9,
    borderRadius: 5,
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
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    paddingBottom: 3,
  },
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
    marginBottom: 30,
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
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#f0f0f0',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#252861',
  },
  changePicButton: {
    marginTop: 10,
  },
  changePicButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: 'bold',
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
    marginBottom: 10,
  },
  inputIcon: {
    padding: 10,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 10,
    fontSize: 16,
    color: '#333',
  },
  centerbox: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  boxAñadir: {
    marginTop: 10,
    backgroundColor: '#252861',
    borderRadius: 8,
    paddingVertical: 15,
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxEliminar: {
    backgroundColor: '#C81B1E',
    borderRadius: 8,
    paddingVertical: 15,
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textAlumnName: {
    color: '#fff',
    fontSize: 16.5,
    fontWeight: 'bold',
  },
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
    position: 'absolute',
    bottom: 0,           
    left: 0,           
    right: 0, 
  },
  footerText: {
    fontSize: 13,
    color: "#fff",
    alignItems: 'center',
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
    marginVertical: 20,
    textAlign: "center",
    color: "#333",
    paddingHorizontal: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  modalButton: {
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
  valid: {
    color: 'green',
  },
  invalid: {
    color: 'red', 
  },
  inputContainerFocused: {
    borderColor: "#1E2A78",
    borderWidth: 2,
  },
});