import React from "react";
import { Button, useToast, Box } from "@chakra-ui/react";

export default function TestToast() {
  const toast = useToast();
  return (
    <Box p={4}>
      <Button onClick={() => toast({ title: "Chakra works!", status: "success" })}>
        Test Toast
      </Button>
    </Box>
  );
}
