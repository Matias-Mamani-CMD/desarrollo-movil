
import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Image, 
  Linking,
  TouchableOpacity,
  BackHandler,
  ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

export default function AboutUs({ navigation }) {
  // Manejar botón físico de atrás
  React.useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  const handleOpenLink = (url) => {
    Linking.openURL(url).catch(err => console.error("Error al abrir el enlace:", err));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ImageBackground
        source={require('../assets/background.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Header rojo*/}
        <View style={styles.header}>
          <Image source={require('../assets/piaget-icon.png')} style={styles.logoHeader} />
          <View>
            <Text style={styles.headerTitle}>Instituto{"\n"}Jean Piaget <Text style={styles.headerNumber}>N°8048</Text></Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
        >

          <Text style={styles.title}>Sobre Nosotros</Text>
          
          <Text style={styles.description}>
            El Instituto Jean Piaget es una institución educativa comprometida con la excelencia 
            académica y la formación integral de nuestros estudiantes. Fundado en [año de fundación], 
            nos enorgullece ofrecer una educación de calidad que combina tradición e innovación.
          </Text>

          {/* Misión y Visión */}
          <View style={styles.section}>
            <View style={styles.card}>
              <MaterialIcons name="flag" size={24} color="#C8102E" />
              <Text style={styles.cardTitle}>Misión</Text>
              <Text style={styles.cardText}>
                Formar personas íntegras, críticas y creativas mediante una educación de calidad 
                que promueva valores, conocimientos y habilidades para el siglo XXI.
              </Text>
            </View>

            <View style={styles.card}>
              <MaterialIcons name="visibility" size={24} color="#1E2A78" />
              <Text style={styles.cardTitle}>Visión</Text>
              <Text style={styles.cardText}>
                Ser reconocidos como una institución líder en innovación educativa, 
                comprometida con el desarrollo integral de nuestros estudiantes y 
                su contribución positiva a la sociedad.
              </Text>
            </View>
          </View>

          {/* Valores */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nuestros Valores</Text>
            <View style={styles.valuesContainer}>
              <View style={styles.valueItem}>
                <FontAwesome name="users" size={20} color="#031666" />
                <Text style={styles.valueText}>Respeto</Text>
              </View>
              <View style={styles.valueItem}>
                <FontAwesome name="graduation-cap" size={20} color="#031666" />
                <Text style={styles.valueText}>Excelencia</Text>
              </View>
              <View style={styles.valueItem}>
                <FontAwesome name="heart" size={20} color="#031666" />
                <Text style={styles.valueText}>Responsabilidad</Text>
              </View>
              <View style={styles.valueItem}>
                <FontAwesome name="lightbulb-o" size={20} color="#031666" />
                <Text style={styles.valueText}>Innovación</Text>
              </View>
            </View>
          </View>

          {/* Contacto */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contacto</Text>
            
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => handleOpenLink('tel:+5438712345678')}
            >
              <FontAwesome name="phone" size={20} color="#1E2A78" />
              <Text style={styles.contactText}>+54 387 1234-5678</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => handleOpenLink('mailto:info@jeanpiaget.edu.ar')}
            >
              <FontAwesome name="envelope" size={20} color="#1E2A78" />
              <Text style={styles.contactText}>info@jeanpiaget.edu.ar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => handleOpenLink('https://maps.app.goo.gl/...')}
            >
              <FontAwesome name="map-marker" size={20} color="#1E2A78" />
              <Text style={styles.contactText}>Calle Principal 123, Salta</Text>
            </TouchableOpacity>
          </View>

          {/* Botón para volver */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <FontAwesome name="arrow-left" size={16} color="#031666ff" />
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </ScrollView>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Jean Piaget</Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );

