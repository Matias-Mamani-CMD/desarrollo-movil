import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';  
import { auth } from '../src/config/firebaseConfig';
import Welcome from '../screens/Welcome';
import Login from '../screens/Login';
import ForgotPassword from '../screens/ForgotPassword';
import SignUp from '../screens/SignUp';
import HomeSecretaria from '../screens/HomeSecretaria';
import AboutUs from '../screens/AboutUs';
import GestionarAlumnos from '../screens/GestionarAlumnos';
import ModificarUsuario from '../screens/ModificarUsuario';
import AddAlumnos from '../screens/AddAlumnos';
import PerfilUsuario from '../screens/PerfilUsuario';

const Stack = createStackNavigator();

function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          gestureEnabled: false
        }} 
        initialRouteName={isAuthenticated ? "HomeSecretaria" : "Welcome"}
      >
        <Stack.Screen name="Welcome" component={Welcome}/>
        <Stack.Screen name="Login" component={Login} options={{ gestureEnabled: false }} />
        <Stack.Screen name="SignUp" component={SignUp} options={{ gestureEnabled: false }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ gestureEnabled: false }} />
        <Stack.Screen name="HomeSecretaria" component={HomeSecretaria} />
        <Stack.Screen name="AboutUs" component={AboutUs} options={{ gestureEnabled: false }} /> 
        <Stack.Screen name="GestionarAlumnos" component={GestionarAlumnos} options={{ gestureEnabled: false }} />
        <Stack.Screen name="AddAlumnos" component={AddAlumnos} options={{ gestureEnabled: false }} />
        <Stack.Screen name="PerfilUsuario" component={PerfilUsuario} options={{ gestureEnabled: false }} />
        <Stack.Screen name="ModificarUsuario" component={ModificarUsuario} options={{ gestureEnabled: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigation;
