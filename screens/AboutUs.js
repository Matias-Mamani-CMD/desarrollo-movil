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
              <Text style={styles.contactText}>Calle 123, Salta</Text>
            </TouchableOpacity>
          </View>

          {/* Botón para volver */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <FontAwesome name="arrow-left" size={30} color="#031666ff" />
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </ScrollView>
        
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#2f2f2fff',
    textAlign: 'center',
    marginTop: '30',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C8102E',
    marginBottom: 15,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 15,
    borderLeftColor: '#1E2A78',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E2A78',
    marginVertical: 10,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
  valuesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  valueItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#cfd9f7ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  valueText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#1E2A78',
    textAlign: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
  },
  contactText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
 
  backButton: {
  position: 'absolute',
  top: -2,     // distancia desde el borde superior
  left: 5,    // distancia desde el borde izquierdo
  flexDirection: 'row',
  alignItems: 'center',
  padding: 20,
},

   /* position:'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    /*justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
    padding: 15,
    /*backgroundColor: '#fff',*/
    /*borderRadius: 8,
    borderWidth: 1,
    borderColor: '#031666ff',*/

  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#031666ff',
    marginLeft: 8,
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
  },
});

