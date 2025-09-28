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
   BackHandler
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
  // Estados para el enfoque de los campos
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
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
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Error",
        "La contraseña debe tener al menos 6 caracteres, incluyendo una letra mayúscula, una minúscula y un número."
      );
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Registro exitoso", "Usuario registrado con éxito.");
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); 
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
        {/* Header rojo */}
        <View style={styles.header}>
          <Image source={require('../assets/piaget-icon.png')} style={styles.logoHeader} />
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
            <Image source={require('../assets/logo.png')} style={styles.iconSign}/>

            <Text style={styles.title}>Regístrate</Text>

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

            <Text style={styles.label}>Apellido</Text>
            <View style={[styles.inputContainer, lastNameFocused && styles.inputContainerFocused]}>
              <FontAwesome name="user" size={20} style={styles.icon}/>
              <TextInput
                style={styles.input}
                placeholder="Ingrese su apellido"
                placeholderTextColor="#787878ff"
                value={lastName}
                onChangeText={setLastName}
                onFocus={() => setLastNameFocused(true)}
                onBlur={() => setLastNameFocused(false)}
              />
            </View>

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
                onFocus={() => {setPasswordFocused(true)}}
                onBlur={() => {setPasswordFocused(false)}}
                
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

            {/* Botón para volver a Welcome */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.replace('Welcome')}
            >
              <FontAwesome name="arrow-left" size={16} color="#031666ff" />
              <Text style={styles.backButtonText}>Volver al inicio</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.replace('Login')}>
              <Text style={styles.signUpText}>¿Ya tienes cuenta? Inicia sesión</Text>
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
  logoHeader: {
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
  passwordHintContainer: {
  width: '100%',
  minHeight: 40,       // ocupa un espacio fijo para que no mueva los campos
  justifyContent: 'center',
  marginBottom: 15,
  },
  passwordHint: {
  fontSize: 13,
  color: 'red',
  },
  icon: {
    color: '#333',
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