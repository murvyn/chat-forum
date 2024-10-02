import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Redirect } from "expo-router";
import 'react-native-reanimated';

const App = () => {
    const {session} = useAuth()
    
    if(session){
        return <Redirect href="/(app)/(tabs)/direct-messages" />
    }
    return <Redirect href="/sign-in" />
}

export default App