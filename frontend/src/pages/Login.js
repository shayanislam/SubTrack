import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Box, Button, Heading, Input, Link as ChakraLink, VStack, Text } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      nav("/app");
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={6} borderWidth="1px" borderRadius="lg" bg="white">
      <Heading size="lg" mb={4}>Log in</Heading>
      {err && <Text color="red.500" mb={2}>{err}</Text>}
      <VStack as="form" onSubmit={onSubmit} spacing={3} align="stretch">
        <Input placeholder="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <Input placeholder="Password" type="password" value={pw} onChange={(e)=>setPw(e.target.value)} required />
        <Button type="submit" colorScheme="blue">Log in</Button>
      </VStack>
      <Text mt={3}>
        New here?{" "}
        <ChakraLink as={Link} to="/signup" color="blue.500">Create an account</ChakraLink>
      </Text>
    </Box>
  );
}
