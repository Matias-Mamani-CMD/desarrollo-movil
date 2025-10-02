import React, { useState, useEffect } from 'react';
import {
   View,
   Text, 
   TextInput, 
   TouchableOpacity, 
   StyleSheet,
   Image,
   ImageBackground,
   ScrollView,
   KeyboardAvoidingView,
   Platform,
   BackHandler,
   Dimensions,
   Modal,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { auth } from '../src/config/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUp({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  //Validadores
  const validadorcaracteres = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+$/;
  const validadorEmail = /^[a-zA-Z0-9._-]+@(gmail|hotmail|outlook|yahoo|live|msn|icloud|me|aol|protonmail|proton|mail|zoho|yandex|gmx|terra|arnet|speedy|fibertel|ciudad)\.com$/;
  // Estados para el enfoque de los campos
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [onConfirm, setOnConfirm] = useState(() => () => {});
  const [alertType, setAlertType] = useState("error"); // "error" o "success"
  
  const showCustomAlert = (title, message, confirmAction, type = "error") => {
    setAlertTitle(title);
    setAlertMessage(message);
    setOnConfirm(() => confirmAction || (() => setShowAlert(false)));
    setAlertType(type);
    setShowAlert(true);
  };


  // Manejar botón físico de atrás - Siempre va a Welcome
  useEffect(() => {
    const backAction = () => {
      navigation.replace('Welcome');
      return true; // Previene el comportamiento por defecto
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      showCustomAlert("Error", "Todos los campos son obligatorios.", null, "error");
      return;
    }
    let validname = validadorcaracteres.test(firstName)
    let validsurname = validadorcaracteres.test(lastName)

    if (!validname || !validsurname) {
      showCustomAlert("Error", "Los nombres solo deben contener caracteres", null, "error")
      return;
    }
    if (!validadorEmail.test(email)) {
      showCustomAlert("Error", "El formato del correo electrónico no es válido.", null, "error");
      return;
    }
    if (password !== confirmPassword) {
      showCustomAlert("Error", "Las contraseñas no coinciden.", null, "error");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      
      showCustomAlert(
        "Registro exitoso",
        "Usuario registrado con éxito.",
        () => {
          setShowAlert(false);
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
        "success" // este define que se muestre azul
      );
    } catch (error) {
      let errorMessage = "Hubo un problema al registrar el usuario.";
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "El correo electrónico ya está en uso.";
          break;
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico no es válido.";
          break;
        case 'auth/weak-password':
          errorMessage = "La contraseña es demasiado débil.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Error de conexión, por favor intenta más tarde.";
          break;
      }

      showCustomAlert("Error", errorMessage, null, "error");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ImageBackground
        source={require('../assets/background.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Header corregido */}
        <View style={styles.header}>
          <Image source={require('../assets/piaget-icon.png')} style={styles.logo} />
          <View>
            <Text style={styles.headerTitle}>
              Instituto{"\n"}Jean Piaget <Text style={styles.headerNumber}>N°8048</Text>
            </Text>
          </View>
        </View>        

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView>
            <View style={styles.contentWrapper}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.replace('Welcome')}
              >
                <FontAwesome name="arrow-left" size={25} color="#031666ff" />
                <Text style={styles.backButtonText}>Volver</Text>
              </TouchableOpacity>
            
              {/* Card translúcida */}
              <View style={styles.card}>
                <View style={styles.topSection}>
                  <Text style={styles.title}>Regístrate</Text>
                </View>
                
                {/* Nombre */}
                <Text style={styles.label}>Nombre</Text>
                <View style={[styles.inputContainer, firstNameFocused && styles.inputContainerFocused]}>
                  <FontAwesome name="user" size={20} style={styles.icon}/>
                  <TextInput
                    style={styles.input}
                    placeholder="Ingrese su nombre"
                    placeholderTextColor="#787878ff"
                    value={firstName}
                    onChangeText={setFirstName}
                    onFocus={() => setFirstNameFocused(true)}
                    onBlur={() => setFirstNameFocused(false)}
                  />
                </View>

                {/* Apellido */}
                <Text style={styles.label}>Apellido</Text>
                <View style={[styles.inputContainer, lastNameFocused && styles.inputContainerFocused]}>
                  <FontAwesome name="user" size={20} style={styles.icon}/>
                  <TextInput
                    style={styles.input}
                    keyboardType=""
                    placeholder="Ingrese su apellido"
                    placeholderTextColor="#787878ff"
                    value={lastName}
                    onChangeText={setLastName}
                    onFocus={() => setLastNameFocused(true)}
                    onBlur={() => setLastNameFocused(false)}
                  />
                </View>

                {/* Correo */}
                <Text style={styles.label}>Correo</Text>
                <View style={[styles.inputContainer, emailFocused && styles.inputContainerFocused]}>
                  <FontAwesome name="envelope" size={20} style={styles.icon}/>
                  <TextInput
                    style={styles.input}
                    placeholder="Ingrese su correo"
                    placeholderTextColor="#787878ff"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>

                {/* Contraseña */}
                <Text style={styles.label}>Contraseña</Text>
                <View style={[styles.inputContainer, passwordFocused && styles.inputContainerFocused]}>
                  <FontAwesome name="lock" size={20} style={styles.icon}/>  
                  <TextInput
                    style={styles.input}
                    placeholder={'Ingrese su contraseña'}
                    placeholderTextColor="#787878ff"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <FontAwesome 
                      name={showPassword ? "eye-slash" : "eye"} 
                      size={20} 
                      style={styles.icon} 
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.passwordHintContainer}>
                  <Text style={styles.passwordHint}>
                    Al menos 6 caracteres, incluyendo una mayúscula, una minúscula y un número.
                  </Text>
                </View>

                {/* Confirmar Contraseña */}
                <Text style={styles.label}>Confirmar Contraseña</Text>
                <View style={[styles.inputContainer, confirmPasswordFocused && styles.inputContainerFocused]}>
                  <FontAwesome name="lock" size={20} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirme su contraseña"
                    placeholderTextColor="#787878ff"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(false)}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <FontAwesome 
                      name={showConfirmPassword ? "eye-slash" : "eye"} 
                      size={20} 
                      style={styles.icon} 
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                  <Text style={styles.buttonText}>Registrarse</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.replace('Login')}>
                  <Text style={styles.signUpText}>¿Ya tienes cuenta? Inicia sesión</Text>
                </TouchableOpacity>
              </View>

              {/* Espacio flexible que empuja el footer hacia abajo */}
              <View style={styles.flexSpacer} />
              
              {/* Footer que solo se ve al hacer scroll hasta el final */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>© 2025 Jean Piaget</Text>
              </View>
            </View>

            <Modal
              visible={showAlert}
              transparent
              animationType="fade"
              onRequestClose={() => setShowAlert(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  
                  {/* Header que cambia según el tipo */}
                  <View
                    style={[
                      styles.modalDetail,
                      alertType === "success" ? styles.modalDetailSuccess : styles.modalDetailError
                    ]}
                  >
                    <Text style={styles.modalTitle}>{alertTitle}</Text>
                  </View>

                  <Text style={styles.modalMessage}>{alertMessage}</Text>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={onConfirm}
                    >
                      <Text style={styles.modalButtonText}>
                        Aceptar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>


          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const { height, width } = Dimensions.get('window');

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
  // Header corregido - igual que en Welcome
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C8102E",
    boxShadow: '6px 2px 6px 1px #0000007e',
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
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 26,
    marginLeft: -10,
  },
  headerNumber: {
    color: "#fff",
    fontSize: 13,
  },
  keyboardAvoidingView: {
    flex: 1,
    width: '100%',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: "#ffffffd1",
    borderRadius: 10,
    borderColor: '#000000ff',
    borderWidth: 1,
    alignSelf: 'center',
    marginTop:10,
  },
  topSection: {
    borderWidth: 1,
    borderTopLeftRadius:10,
    borderTopRightRadius:10,
    marginVertical:-1,
    backgroundColor: "#1E2A78",
    padding: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 25,
    fontWeight: '600',
    marginBottom: 0,
    textAlign: 'center',
    color: '#ffffffff',
  },
  label: {
    marginLeft:16,
    alignSelf: 'flex-start',
    fontSize: 18,
    fontWeight: 'condensed',
    marginTop: 15,
    color: '#000000ff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderColor: '#000000ff',
    borderWidth: 0.3,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 15,
    marginLeft:8,
    marginRight:8,
    width: '95%',
  },
  inputContainerFocused: {
    borderColor: "#1E2A78",
    borderWidth: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    marginLeft: 8,
  },
  icon: {
    color: '#333',
  },
  passwordHintContainer: {
    width: '95%',
    minHeight: 40,
    justifyContent: 'center',
    marginBottom: 1,
    marginLeft:15,
  },
  passwordHint: {
    fontSize: 13,
    color: 'red',
  },
  button: {
    backgroundColor: '#031666ff',
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical:15,
    width: '95%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#ffffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
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
  signUpText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 15,
    color: '#136dffff',
    textAlign: 'center',
  },
  flexSpacer: {
    flex: 1,
    minHeight: 30, // Espacio mínimo para asegurar que el footer quede fuera de la vista inicial
  },
  footer: {
    width: width,
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingBottom: 20,
    elevation: 5,
    alignItems: 'center',
    borderWidth: 2,
    borderWidth: 1.5,
    borderColor: "#000000ff",
    boxShadow: '1px 1px 7px 3px #2727277e',
  },
  modalDetail: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalTitle: {
    fontSize: 18, 
    fontWeight: "bold",
    color: "#ffffffff",
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    backgroundColor: '#252861',
    flex: 1,
    marginHorizontal: 82,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: '#ffffffff',
  },
  modalDetailSuccess: {
    backgroundColor: '#252861', // azul
  },
  modalDetailError: {
    backgroundColor: '#C81B1E', // rojo
  },
});