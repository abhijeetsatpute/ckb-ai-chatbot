// File: ChatWidget.tsx
import React, { useState } from "react";
import { Box, TextField, IconButton, Paper, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { motion } from "framer-motion";

const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<
    { sender: "user" | "bot"; text: string }[]
  >([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages([...messages, { sender: "user", text: userMsg }]);
    setInput("");

    const res = await fetch("http://localhost:3001/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: userMsg }),
    });
    const data = await res.json();
    setMessages((prev) => [...prev, { sender: "bot", text: data.answer }]);
  };

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        width: 300,
        height: 400,
        display: "flex",
        flexDirection: "column",
        p: 1,
      }}
    >
      <Typography variant="h6">Ashay AI</Typography>
      <Box flex={1} overflow="auto" mb={1}>
        {messages.map((msg, i) => (
          <Box
            key={i}
            textAlign={msg.sender === "user" ? "right" : "left"}
            my={0.5}
          >
            <Typography
              variant="body2"
              bgcolor={msg.sender === "user" ? "primary.main" : "grey.300"}
              color={msg.sender === "user" ? "white" : "black"}
              borderRadius={2}
              px={1}
              py={0.5}
              display="inline-block"
            >
              {msg.text}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box display="flex">
        <TextField
          size="small"
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <IconButton onClick={handleSend}>
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default ChatWidget;
