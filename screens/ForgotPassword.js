<<<<<<< Updated upstream
=======
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text,
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Image, 
  ImageBackground, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  BackHandler,
  ActivityIndicator
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { auth } from '../src/config/firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Manejar botón físico de atrás - Va a Login (no a Welcome)
  useEffect(() => {
    const backAction = () => {
      navigation.replace('Login');
      return true; // Previene el comportamiento por defecto
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Por favor ingrese su correo electrónico.");
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Por favor ingrese un correo electrónico válido.");
      return;
    }

    setIsLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Correo enviado", 
        "Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico.",
        [
          {
            text: "OK",
            onPress: () => navigation.replace('Login')
          }
        ]
      );
    } catch (error) {
      let errorMessage = "Hubo un problema al enviar el correo de restablecimiento.";
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico no es válido.";
          break;
        case 'auth/user-not-found':
          errorMessage = "No se encontró un usuario con este correo.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Error de conexión, por favor intenta más tarde.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Demasiados intentos. Por favor espera antes de intentar nuevamente.";
          break;
        default:
          errorMessage = `Error: ${error.code}. ${error.message}`;
      }
      Alert.alert("Error", errorMessage);
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
        {/* Header rojo */}
        <View style={styles.header}>
          <Image source={require('../assets/piaget-icon.png')} style={styles.logo} />
          <View>
            <Text style={styles.headerTitle}>Instituto{"\n"}Jean Piaget <Text style={styles.headerNumber}>N°8048</Text></Text>
          </View>
        </View>
        
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, width: '100%' }}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <Image source={require('../assets/restablecerContraseña.png')} style={styles.iconSign} />

            <Text style={styles.title}>Restablecer contraseña</Text>
            <Text style={styles.subtitle}>Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</Text>

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

            {/* Botón para volver a Login */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.replace('Login')}
              disabled={isLoading}
            >
              <FontAwesome name="arrow-left" size={30} color="#031666ff" />
              <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Jean Piaget</Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 0,
  },
  inputContainerFocused: {
    borderColor: "#1E2A78",
    borderWidth: 2,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#C8102E",
    paddingLeft: 0,
  },
  logo: {
    width: 105,
    height: 105,
    resizeMode: "cover",
    marginTop: -15,
    marginBottom: -10,
    marginLeft: -15,
  },
  iconSign: {
    width: 140,
    height: 140,
    marginTop: -100,
    marginBottom: 10,
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
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  input: {
    flex: 10,
    fontSize: 16,
    color: '#000',
    marginLeft: 8,
    
  },
  icon: {
    color: '#333',
  },
  // estilos para el botón de volver
  backButton: {
  position: 'absolute',
  top: -2,     // distancia desde el borde superior
  left: 5,    // distancia desde el borde izquierdo
  flexDirection: 'row',
  alignItems: 'center',
  padding: 20,
},
  
    /*flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,*/

  backButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#031666ff',
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#031666ff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginTop: 10,
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#ffffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpText: {
    fontSize: 14,
    fontWeight: 600,
    marginTop: 20,
    color: '#136dffff',
  },
  footer: {
    alignItems: "center",
    padding: 15,
    backgroundColor: "#1E2A78",
  },
  footerText: {
    fontSize: 14,
    color: "#ffffffff",
    marginBottom: 5,
  }
});
>>>>>>> Stashed changes
