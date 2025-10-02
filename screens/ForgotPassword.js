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
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { auth } from '../src/config/firebaseConfig';
import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState("error");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  //Validador del formato de correos permitidos
  const validadorEmail = /^[a-zA-Z0-9._-]+@(gmail|hotmail|outlook|yahoo|live|msn|icloud|me|aol|protonmail|proton|mail|zoho|yandex|gmx|terra|arnet|speedy|fibertel|ciudad)\.com$/;

  const showCustomAlert = (type, title, message, onClose = null) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setCustomAlertVisible(true);

    if (onClose) {
      setTimeout(() => onClose(), 5000);
    }
  };

  useEffect(() => {
    const backAction = () => {
      navigation.replace('Login');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  const checkIfUserExists = async (email) => {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      return signInMethods.length > 0;
    } catch (error) {
      console.error('Error verificando usuario:', error);
      return true;
    }
  };


  const handleResetPassword = async () => {
    // Validación de campo vacío
    if (!email.trim()) {
      showCustomAlert(
        "error",
        "Error",
        "Por favor ingrese su correo electrónico."
      );
      return;
    }

    // Validación de formato de email
    if (!validadorEmail.test(email)) {
      showCustomAlert(
        "error",
        "Error",
        "El correo electrónico no tiene un formato válido. Por favor, verifica e inténtalo nuevamente."
      );
      return;
    }

    setIsLoading(true);
    
    try {
      const userExists = await checkIfUserExists(email);
      
      if (!userExists) {
        showCustomAlert(
          "error",
          "Usuario no encontrado",
          "El correo ingresado no está registrado en el sistema."
        );
        setIsLoading(false);
        return;
      }

      await sendPasswordResetEmail(auth, email);
      
      showCustomAlert(
        "success",
        "Correo enviado",
        "Hemos enviado un enlace para restablecer tu contraseña a tu correo electrónico. Revisa la bandeja de entrada y la carpeta de spam.",
        () => navigation.replace('Login')
      );
    } catch (error) {
      console.error('Error en restablecimiento de contraseña:', error);
      
      let errorMessage = "Hubo un problema al enviar el correo de restablecimiento.";
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico no es válido.";
          break;
        case 'auth/user-not-found':
          errorMessage = "No se encontró un usuario con este correo electrónico.";
          break;
        case 'auth/user-disabled':
          errorMessage = "Esta cuenta ha sido deshabilitada. Contacta al administrador.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Error de conexión, por favor intenta más tarde.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Demasiados intentos. Por favor espera unos minutos antes de intentar nuevamente.";
          break;
        default:
          errorMessage = "Ocurrió un error inesperado. Por favor intenta más tarde.";
      }
      
      showCustomAlert("error", "Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ImageBackground
        source={require('../assets/background.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Header */}
        <View style={styles.header}>
          <Image source={require('../assets/piaget-icon.png')} style={styles.logo} />
          <View>
            <Text style={styles.headerTitle}>
              Instituto{"\n"}Jean Piaget <Text style={styles.headerNumber}>N°8048</Text>
            </Text>
          </View>
        </View>

        {/* Contenido + scroll */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.replace('Login')}
              disabled={isLoading}
            >
              <FontAwesome name="arrow-left" size={25} color="#252861" />
              <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>

            <Image source={require('../assets/restablecerContraseña.png')} style={styles.iconSign} />

            <Text style={styles.title}>Restablecer contraseña</Text>
            <Text style={styles.subtitle}>
              Ingrese su correo electrónico y le enviaremos un enlace para restablecer tu contraseña.
            </Text>

            <Text style={styles.label}>Correo electrónico</Text>
            <View style={[styles.inputContainer, emailFocused && styles.inputContainerFocused]}>
              <FontAwesome name="envelope" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Ingrese su correo electrónico"
                placeholderTextColor="#787878ff"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Enviar enlace</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Footer fijo */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Jean Piaget</Text>
        </View>

        {/* Modal de alertas */}
        <Modal
          visible={customAlertVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setCustomAlertVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[
              styles.alertBox, 
              alertType === "success" ? styles.alertSuccess : styles.alertError
            ]}>
              <Text style={[
                styles.alertTitle, 
                alertType === "success" ? styles.alertTitleSuccess : styles.alertTitleError
              ]}>
                {alertTitle}
              </Text>

              <Text style={styles.alertMessage}>{alertMessage}</Text>

              <TouchableOpacity
                style={styles.alertButton}
                onPress={() => setCustomAlertVisible(false)}
              >
                <Text style={styles.alertButtonText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');


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
  keyboardAvoidingView: {
    flex: 1,
    width: '100%',
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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40, // Espacio extra al final
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#252861',
    marginLeft: 8,
  },
  iconSign: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 15,
    color: '#2f2f2fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 25,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    color: '#000000ff',
    padding: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 20,
    width: '100%',
  },
  inputContainerFocused: {
    borderColor: "#1E2A78",
    borderWidth: 2,
  },
  input: {
    flex: 10,
    fontSize: 16,
    color: '#000',
    marginLeft: 8,
  },
  icon: {
    color: '#333',
  },
  button: {
    backgroundColor: '#252861',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginTop: 10,
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    alignSelf: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#ffffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
    flexSpacer: {
    flex: 1,
    minHeight: 0, // Espacio mínimo para asegurar que el footer quede fuera de la vista inicial
  },
  footer: {
    width: '100%',
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
  modalHeaderSuccess: {
    backgroundColor: "#1E2A78", // azul
    borderTopWidth: 5,
    borderTopColor: "#1E2A78",
  },
  modalHeaderError: {
    backgroundColor: "#DB2024", // rojo
    borderTopWidth: 5,
    borderTopColor: "#DB2024",
  },
  alertBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingBottom: 20,
    elevation: 5,
    alignItems: 'center',
    borderWidth: 2,
    borderWidth: 1.5,
    borderColor: "#000000ff",
    boxShadow: '1px 1px 7px 3px #2727277e',
    overflow: 'hidden', // mantiene el borde redondeado del alert
  },
  alertTitleSuccess: {
    backgroundColor: "#252861",
    width: '100%',
    padding: 10,
    color: "#ffffffff", // texto azul
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  alertTitleError: {
    backgroundColor: "#DB2024",
    width: '100%',
    padding: 10,
    color: "#ffffffff", // texto rojo
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  alertMessage: {
    fontSize: 16,
    paddingTop: 18,
    marginBottom: 18,
    textAlign: "center",
  },
  alertButton: {
    backgroundColor: "#252861",
    paddingHorizontal: 50,
    paddingVertical: 13,
    borderRadius: 5,
  },
  alertButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});