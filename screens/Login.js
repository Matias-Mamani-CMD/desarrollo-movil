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
  Switch,
  BackHandler
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingrese ambos campos.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);

      if (rememberMe) {
        await AsyncStorage.setItem("userEmail", email);
      } else {
        await AsyncStorage.removeItem("userEmail"); 
      }

      Alert.alert("Login exitoso", "Has iniciado sesión correctamente.");
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] }); 
    } catch (error) {
      let errorMessage = "Hubo un problema al iniciar sesión.";
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico no es válido.";
          break;
        case 'auth/wrong-password':
          errorMessage = "La contraseña es incorrecta.";
          break;
        case 'auth/user-not-found':
          errorMessage = "No se encontró un usuario con este correo.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Error de conexión, por favor intenta más tarde.";
          break;
      }
      Alert.alert("Error", errorMessage);
    }
  };

  useEffect(() => { 
    const loadEmail = async () => { 
      const savedEmail = await AsyncStorage.getItem("userEmail"); 
      if (savedEmail) { 
        setEmail(savedEmail); 
        setRememberMe(true); 
      }
    }; 
    loadEmail(); 
  }, []);

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
            <Image source={require('../assets/logo.png')} style={styles.iconSign} />

            <Text style={styles.title}>Iniciar sesión</Text>

            <Text style={styles.label}>Correo</Text>
            <View style={[styles.inputContainer, emailFocused && styles.inputContainerFocused]}>
              <FontAwesome name="envelope" size={20} style={styles.icon} />
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

            <Text style={styles.label}>Contraseña</Text>
            <View style={[styles.inputContainer, passwordFocused && styles.inputContainerFocused]}>
              <FontAwesome name="lock" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Ingrese su contraseña"
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

            {/* Enlace para olvidar contraseña */}
            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <View style={styles.switchContainer}>
              <Text style={styles.label}>Recordarme</Text> 
              <Switch 
                value={rememberMe} 
                onValueChange={setRememberMe}
                trackColor={{ false: "#ccc", true: "#0317668f" }}
                thumbColor={rememberMe ? "#031666ff" : "#f4f3f4"}
              /> 
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Ingresar</Text>
            </TouchableOpacity>

            {/* Botón para volver a Welcome */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.replace('Welcome')}
            >
              <FontAwesome name="arrow-left" size={16} color="#031666ff" />
              <Text style={styles.backButtonText}>Volver al inicio</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.replace('SignUp')}>
              <Text style={styles.signUpText}>¿No tienes cuenta aún? Regístrate</Text>
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
    marginTop: 20,
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
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#2f2f2fff',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    color: '#000000ff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
    width: '100%',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 8,
  },
  icon: {
    color: '#333',
  },
  // Estilo para el contenedor del enlace "Olvidé contraseña"
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#136dffff',
  },
  // Nuevos estilos para el botón de volver
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#031666ff',
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#031666ff',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
  },
  footer: {
    alignItems: "center",
    padding: 10,
    backgroundColor: "#1E2A78",
  },
  footerText: {
    fontSize: 13,
    color: "#fff",
  }
});