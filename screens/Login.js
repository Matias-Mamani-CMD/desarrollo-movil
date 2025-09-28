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
  BackHandler,
  Dimensions
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

  // Manejar botón físico de atrás
  useEffect(() => {
    const backAction = () => {
      navigation.replace('Welcome');
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, [navigation]);

  // Cargar email guardado
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

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
          >
            {/* Back Button */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.replace('Welcome')}
            >
              <FontAwesome name="arrow-left" size={25} color="#031666ff" />
              <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>

            {/* Card login */}
            <View style={styles.card}>
              <View style={styles.topSection}>
                <Text style={styles.title}>Iniciar Sesión</Text>
              </View>

              {/* Email */}
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

              {/* Password */}
              <Text style={styles.label}>Contraseña</Text>
              <View style={[styles.inputContainer, passwordFocused && styles.inputContainerFocused]}>
                <FontAwesome name="lock" size={20} style={styles.icon}/>
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

              {/* Contenedor para Recordarme y Olvidé contraseña */}
              <View style={styles.optionsContainer}>
                {/* Recordarme a la izquierda */}
                <View style={styles.rememberContainer}>
                  <Switch
                    value={rememberMe}
                    onValueChange={setRememberMe}
                    trackColor={{ false: "#ccc", true: "#0317668f" }}
                    thumbColor={rememberMe ? "#031666ff" : "#f4f3f4"}
                  />
                  <Text style={styles.rememberText}>Recordarme</Text>
                </View>

                {/* Olvidé contraseña a la derecha */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgotPassword')}
                >
                  <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Ingresar</Text>
              </TouchableOpacity>

              {/* Go to SignUp */}
              <TouchableOpacity onPress={() => navigation.replace('SignUp')}>
                <Text style={styles.signUpText}>¿No tienes cuenta aún? Regístrate</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Footer fijo */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Jean Piaget</Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get('window');

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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    minHeight: height - 150, // Altura mínima para evitar desplazamientos excesivos
  },
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
    color: '#031666ff',
    marginLeft: 8,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: "#ffffffd1",
    borderRadius: 10,
    borderColor: '#000000ff',
    borderWidth: 1,
    alignSelf: 'center',
    paddingBottom: 15,
    marginTop: 40,
  },
  topSection: {
    borderWidth: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginVertical: -1,
    backgroundColor: "#1E2A78",
    padding: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 25,
    fontWeight: '600',
    textAlign: 'center',
    color: '#ffffffff',
  },
  label: {
    marginLeft: 16,
    alignSelf: 'flex-start',
    fontSize: 18,
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
    marginLeft: 8,
    marginRight: 8,
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
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    fontSize: 14,
    color: '#000000ff',
    marginLeft: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
    color: '#136dffff',
  },
  button: {
    backgroundColor: '#031666ff',
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 15,
    width: '95%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#ffffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 20,
    color: '#136dffff',
    textAlign: 'center',
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
});