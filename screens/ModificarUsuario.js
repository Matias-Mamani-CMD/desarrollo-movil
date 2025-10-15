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
import { FontAwesome, MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

export default function ModificarUsuario() {
  const navigation = useNavigation();

  // Estados para los datos del usuario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [imageUri, setImageUri] = useState(null);

  // Estado para el modal de la imagen
  const [imageModalVisible, setImageModalVisible] = useState(false);

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
  // Función para verificar
const authenticateUser = async () => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Confirma tu identidad para actualizar el perfil",
      cancelLabel: "Cancelar",
      disableDeviceFallback: false, 
      fallbackLabel: "Usar contraseña del dispositivo",
      requireConfirmation: false, // No requiere doble confirmación
    });

    if (result.success) {
      return true;
    }

    // Si falló verifica el motivo
    if (result.error === 'user_cancel') {
      showCustomAlertPerfil(
        "Autenticación cancelada",
        "Necesitas confirmar tu identidad para actualizar el perfil.",
        () => setShowAlertPerfil(false)
      );
    } else if (result.error === 'not_enrolled') {
      showCustomAlertPerfil(
        "Configuración requerida",
        "Configura un método de bloqueo de pantalla (huella, Face ID, PIN o patrón) en los ajustes de tu dispositivo.",
        () => setShowAlertPerfil(false)
      );
    } else {
      showCustomAlertPerfil(
        "Autenticación fallida",
        "No se pudo verificar tu identidad. Intenta nuevamente.",
        () => setShowAlertPerfil(false)
      );
    }

    return false;
  } catch (error) {
    console.error("Error en autenticación:", error);
    showCustomAlertPerfil(
      "Error",
      "Ocurrió un problema con la autenticación. Verifica tu configuración de seguridad.",
      () => setShowAlertPerfil(false)
    );
    return false;
  }
};

const handleUpdateProfile = async () => {
  if (!validadorEmail.test(correo)) {
    showCustomAlertPerfil("Error", "El Formato del correo es invalido.", () => setShowAlertPerfil(false));
    setIsSaving(false);
    return;
  }

  // AUTENTICACIÓN ANTES DE PROCEDER
  const isAuthenticated = await authenticateUser(); 
  if (!isAuthenticated) {
    showCustomAlertPerfil(
      "Autenticación fallida(Obligatoria)",
      " Para actualizar tu perfil, es necesario que configures un método de bloqueo de pantalla (patrón, PIN, contraseña o biometría) en tu dispositivo.",
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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

          <Modal
              transparent={true}
              visible={menuVisible}
              animationType="none"
              onRequestClose={toggleMenu}
          >
              <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={toggleMenu}>
                  <Animated.View style={[styles.button, { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }]}>
                      <View>
                          <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); handleLogOut(); }}>
                              <Text style={styles.buttonText}>Cerrar sesión</Text>
                              <Ionicons name="exit-outline" size={22} color="white" style={{paddingLeft: 5}} />
                          </TouchableOpacity>
                      </View>
                  </Animated.View>
              </TouchableOpacity>
          </Modal>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <FontAwesome name="arrow-left" size={25} color="#031666ff" />
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

                <View>
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
                    <TouchableOpacity style={[styles.boxChangePassword]} onPress={() => {
                      navigation.navigate('ForgotPassword');
                      }}>
                      <View style={styles.changePasswordIcons}>
                        <FontAwesome name="lock" size={20} paddingRight={20} paddingLeft={10} style={styles.icon}/>
                        <View style={styles.verticalLine} />
                        <Text style={[styles.textChangePassword, {paddingTop: 0}]}>Cambiar Contraseña</Text>
                        <View style={[styles.spaceChangePassword]}/>
                        <View style={styles.verticalLineRight}/>
                        <MaterialIcons name="navigate-next" size={24} paddingLeft={10} color="black" />
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.boxAñadir]} onPress={handleUpdateProfile} disabled={isSaving || isUploading}>
                      <Text style={[styles.textButton, {paddingTop: 0}]}>{isSaving || isUploading ? 'Guardando...' : 'Aceptar'}</Text>
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

            {/* Modal para ver la imagen de perfil */}
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
          </ImageBackground>
        </SafeAreaView>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000c6',
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    height: '100%',
    width: '100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: 30,
    backgroundColor: 'transparent',
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#C81B1E",
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    backgroundColor: "#1E2A78",
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
    backgroundColor: '#ffffffff',
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 5,
    marginHorizontal:10,
    marginVertical:10,
  },
  backButtonText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#031666ff',
    marginLeft: 8,
  },
  formContainer: {
    width: '95%',
    maxWidth: 900,
    backgroundColor: "#ffffffc0",
    borderRadius: 25, // Puedes usar solo esta propiedad
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderColor: '#00000030', // Más transparente
    borderWidth: 0.5, // Un poco más grueso
    alignSelf: 'center',
    marginTop: 25,
    paddingBottom: 30,
    // Sombra mejorada
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  formHeader: {
    borderWidth: 0.3,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginVertical: -1,
    backgroundColor: "#1E2A78",
    padding: 13,
    alignItems: "center",
    shadowColor: '#000000',
    shadowOffset: {
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 1,
    },
  },
  formTitle: {
    fontSize: 25,
    fontWeight: '600',
    marginBottom: 0,
    textAlign: 'center',
    color: '#ffffffff',
  },
  formBody: {
    padding: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#252861',
    backgroundColor: '#dadadac7'
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
    marginLeft: 16,
    alignSelf: 'flex-start',
    fontWeight: 'condensed',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderColor: '#000000ff',
    borderWidth: 0.3,
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginBottom: 15,
    marginLeft:8,
    marginRight:8,
    width: '95%',
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
    backgroundColor: '#031666',
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 15,
    width: '60%',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    justifyContent: 'center',
  },
  changePasswordIcons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 24,
  },
  boxChangePassword: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff9d',
    borderColor: '#4e4e4eff',
    borderWidth: 0.3,
    paddingHorizontal: 15,
    paddingVertical: 17,
    marginTop: 20,
    marginBottom: 20,
    marginLeft:8,
    marginRight:8,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: {
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 1,
    },
  },
  verticalLine: {
    width: 1,
    height: '120%',
    backgroundColor: '#8b8b8bc5'
  },
  verticalLineRight: {
    width: 1,
    height: '120%',
    backgroundColor: '#8b8b8bc5',
  },
  spaceChangePassword: {
    width: 150,
  },
  textButton: {
    paddingTop: 2,
    color: '#ffff',
    fontSize: 18,
    fontWeight: '500',
  },
  textChangePassword: {
    paddingTop: 2,
    paddingLeft: 10,
    color: '#1d1d1dff',
    fontSize: 16,
    fontWeight: '400',
  },
  spacer: {
    height: 30,
  },
  footer: {
    alignItems: "center",
    padding: 15,
    marginTop: 20,
    marginBottom: -30,
    backgroundColor: "#1E2A78",
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
    width: '40%',
    borderWidth: 2.5,
    marginHorizontal: 12,
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: '#ffffff'
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