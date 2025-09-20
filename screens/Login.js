import React, { useState } from 'react';
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
  Switch, // para agregar botón en opción "Recordarme"
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(false); // guarda la función


  //ESTADO PARA SABER SI EL CAMPO FUE SELECCIONADO
  //SET ACTUALIZA EL ESTADO 
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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
      } // Guarda el email si se marcó la casilla

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

  React.useEffect(() => { 
    const loadEmail = async () => { 
      const savedEmail = await AsyncStorage.getItem("userEmail"); 
      if (savedEmail) { setEmail(savedEmail); 
        setRememberMe(true); 
      }
    }; 
    loadEmail(); 
  }, []); //recupera email guardado al abrir el inicio de sesión

  return (
    <ImageBackground
      source={require('../assets/background.jpg')}
      style={styles.background}
      imageStyle = {{opacity: 0.9}} //opacidad
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, width: '100%' }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Image source={require('../assets/logo.png')} style={styles.logo} />

          <Text style={styles.title}>Iniciar sesión</Text>

          <Text style={styles.label}>Correo</Text>
          <View style={[styles.inputContainer,emailFocused && styles.inputContainerFocused]}>
            <FontAwesome name="envelope" size={20} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ingrese su correo"
              placeholderTextColor="#787878ff"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEmailFocused(true)}   // Cuando el usuario toque el input
              onBlur={() => setEmailFocused(false)}   // estado natural, el usuario no toco el input
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
              onFocus={() => setPasswordFocused(true)} // Cuando el usuario toque el input
              onBlur={() => setPasswordFocused(false)} // estado natural, el usuario no toco el input
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <FontAwesome 
                name={showPassword ? "eye-slash" : "eye"} 
                size={20} 
                style={styles.icon} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Recordarme</Text> 
            <Switch 
              value={rememberMe} 
              onValueChange={setRememberMe}
              trackColor={{ false: "#ccc", true: "#0317668f" }}
              thumbColor={rememberMe ? "#031666ff" : "#f4f3f4"}    // color del "botón"
            /> 
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Ingresar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signUpText}>¿No tienes cuenta aún? Regístrate</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  inputContainerFocused: { //Estilo para el estado del input
  borderColor: '#922b21',
  borderWidth: 2,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
    flexDirection: 'row',   // ícono e input en la misma línea
    alignItems: 'center',
    backgroundColor: '#fff', // fondo blanco
    borderRadius: 12,        // bordes redondeados
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,        // separación entre bloques
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',           // texto oscuro para contraste
    marginLeft: 8,           // espacio respecto al ícono
  },
  icon: {
    color: '#333',           // ícono oscuro
  },
  button: {
    backgroundColor: '#031666ff',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginTop: 20,
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
    color: '#000000ff',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
  },

});
