import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image, Dimensions } from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Welcome({ navigation }) {
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

        {/* Contenido principal */}
        <View style={styles.mainContent}>
          {/* Sección central azul */}
          <View style={styles.topSection}>
            <Text style={styles.welcomeText}>BIENVENIDOS</Text>
            <View style={styles.separator} />
            <Text style={styles.description}>
            Accede de manera segura a la información relevante y forma parte de una comunidad educativa conectada.
            </Text>
          </View>

          {/* Botones */}
          <View style={styles.bottomSection}>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}>
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
              <FontAwesome name="arrow-right" size={16} color="#fff" style={{ marginLeft: 10 }} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { marginTop: 25 }]} onPress={() => navigation.navigate("SignUp")}>
              <Text style={styles.buttonText}>Registrarse</Text>
              <FontAwesome name="arrow-right" size={16} color="#fff" style={{ marginLeft: 10 }} />
            </TouchableOpacity>
          </View>
        </View>



        <View style={styles.aboutContainer}>
          <Text style={styles.aboutText}>Sobre nosotros</Text>
        </View>
        {/* Footer */}
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
  padding: 0,   // eliminar todo padding automático
  },
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  header: {
  flexDirection: "row",        // fila
  alignItems: "center",        // centrado vertical
  justifyContent: "flex-start",// al inicio
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
  mainContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  topSection: {
    backgroundColor: "#1E2A78",
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    padding: 20,
    alignItems: "center",
    marginTop: 0,
    marginHorizontal:0,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 0,
  },
  separator: {
    width: 280,
    height: 3,
    backgroundColor: "#fff",
    marginVertical: 15,
  },
  description: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 20,
  },
  bottomSection: {
    alignItems: "center",
    marginTop:120,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C8102E",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: {
    color: "#ffffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
    aboutContainer: {
    position: 'absolute',
    left: 250,
    bottom: 70, // Ajusta este valor según la altura de tu footer
  },
  aboutText: {
    fontSize: 20,
    color: "#000000ff", // Azul oscuro para contraste
    fontWeight: '600',
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