import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { Box, Flex, Heading, Spacer, Button, HStack } from "@chakra-ui/react";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";

export default function App() {
  const [user, setUser] = useState(null);
  useEffect(() => onAuthStateChanged(auth, setUser), []);

  return (
    <BrowserRouter>
      <Box as="header" p={4} borderBottom="1px solid #eee" bg="white">
        <Flex align="center" maxW="6xl" mx="auto">
          <Heading size="md"><Link to="/">SubTrack</Link></Heading>
          <Spacer />
          {user ? (
            <HStack spacing={3}>
              <Button size="sm" onClick={() => signOut(auth)}>Sign out</Button>
            </HStack>
          ) : (
            <HStack spacing={3}>
              <Button as={Link} to="/login" size="sm" variant="outline">Log in</Button>
              <Button as={Link} to="/signup" size="sm" colorScheme="blue">Sign up</Button>
            </HStack>
          )}
        </Flex>
      </Box>

      <Routes>
        <Route path="/" element={<Navigate to={user ? "/app" : "/login"} replace />} />
        <Route path="/login" element={user ? <Navigate to="/app" replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/app" replace /> : <Signup />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
