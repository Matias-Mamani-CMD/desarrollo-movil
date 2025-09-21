import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';  
import { auth } from '../src/config/firebaseConfig';
import Welcome from '../screens/Welcome';
import Login from '../screens/Login';
import ForgotPassword from '../screens/ForgotPassword';
import SignUp from '../screens/SignUp';
import Home from '../screens/Home';
import AboutUs from '../screens/AboutUs';

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
        initialRouteName={isAuthenticated ? "Home" : "Welcome"}
      >
        <Stack.Screen name="Welcome" component={Welcome}/>
        <Stack.Screen name="Login" component={Login} options={{ gestureEnabled: false }} />
        <Stack.Screen name="SignUp" component={SignUp} options={{ gestureEnabled: false }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="AboutUs" component={AboutUs} options={{ gestureEnabled: false }} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigation;